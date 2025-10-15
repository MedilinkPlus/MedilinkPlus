import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

type Payload = {
  email: string
  role: 'admin' | 'interpreter' | 'user'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload
    const email = (body.email || '').toLowerCase().trim()
    const role = body.role

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing required fields: email, role' }, { status: 400 })
    }

    const admin = createServerClient()

    // 1) Try to get user id from public.users by email (bypass RLS via service role)
    const { data: profile, error: profileErr } = await admin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 400 })
    }

    let userId: string | null = profile?.id ?? null

    // 2) If not found in public.users, fall back to listing auth users and find by email
    if (!userId) {
      const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers()
      if (listErr) {
        return NextResponse.json({ error: listErr.message }, { status: 400 })
      }
      const found = usersPage.users.find(u => (u.email || '').toLowerCase() === email)
      userId = found?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found for provided email' }, { status: 404 })
    }

    // 3) Update Auth user: set role metadata and confirm email
    const { error: updateAuthErr } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: { role }
    } as any)
    if (updateAuthErr) {
      return NextResponse.json({ error: updateAuthErr.message }, { status: 400 })
    }

    // 4) Sync public.users profile safely: update if exists else insert with safe defaults
    const { data: existingProfile, error: existingErr } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 400 })
    }

    if (existingProfile?.id) {
      const { error: updateProfileErr } = await admin
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (updateProfileErr) {
        return NextResponse.json({ error: updateProfileErr.message }, { status: 400 })
      }
    }

    // If profile does not exist, skip insert to avoid password_hash constraint; it will be created on first login.
    return NextResponse.json({ success: true, userId, profileUpdated: !!existingProfile?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user role' }, { status: 500 })
  }
}


