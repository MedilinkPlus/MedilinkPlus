import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

type UpdatePayload = {
  id: string
  name?: string
  role?: 'admin' | 'interpreter' | 'user'
  email?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdatePayload
    const { id, name, role, email } = body || ({} as UpdatePayload)

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
    }

    const admin = createServerClient()

    // 1) Optionally update Auth metadata role
    if (role) {
      const { error: authErr } = await admin.auth.admin.updateUserById(id, {
        user_metadata: { role }
      } as any)
      if (authErr) {
        return NextResponse.json({ error: authErr.message }, { status: 400 })
      }
    }

    // 2) Ensure we have email for upsert (email is NOT NULL in many schemas)
    let effectiveEmail = (email || '').toLowerCase().trim()
    if (!effectiveEmail) {
      const { data: userInfo, error: getErr } = await admin.auth.admin.getUserById(id)
      if (getErr) {
        return NextResponse.json({ error: getErr.message }, { status: 400 })
      }
      effectiveEmail = (userInfo.user?.email || '').toLowerCase()
    }
    if (!effectiveEmail) {
      return NextResponse.json({ error: 'Email is required to update profile' }, { status: 400 })
    }

    // 3) Update public.profiles (users is a view, not the actual table)
    const updates: any = {}
    if (typeof name === 'string') updates.name = name
    if (typeof role === 'string') updates.role = role
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      const { data, error: updErr } = await (admin
        .from('profiles') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()
      if (updErr && (updErr as any).code !== 'PGRST116') {
        // ignore no-row errors
        return NextResponse.json({ error: updErr.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, user: (data as any) || null })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 })
  }
}


