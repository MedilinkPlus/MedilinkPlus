import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body || {}

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role to match database enum
    const normalizedRole = String(role).toLowerCase()
    const allowedRoles = new Set(['user', 'admin', 'interpreter'])
    if (!allowedRoles.has(normalizedRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    // If the user already exists in Auth, reuse it (idempotent create)
    try {
      const { data: list } = await (supabase as any).auth.admin.listUsers({ page: 1, perPage: 200 })
      const existing = list?.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase())
      if (existing) {
        // Ensure profile exists and return
        try {
          await (supabase as any)
            .from('profiles')
            .upsert({ 
              id: existing.id, 
              email, 
              name, 
              role: normalizedRole,
              status: normalizedRole === 'interpreter' ? 'pending' : 'active'
            }, { onConflict: 'id' })
        } catch {}
        return NextResponse.json({ success: true, user: existing, reused: true })
      }
    } catch {}

    const { data, error } = await (supabase as any).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: normalizedRole }
    })

    if (error) {
      // Normalize common errors for better UX
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 })
      }
      if (msg.includes('password')) {
        return NextResponse.json({ error: 'Password does not meet policy.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Ensure app profile exists immediately (idempotent)
    try {
      await (supabase as any)
        .from('profiles')
        .upsert({
          id: data.user?.id,
          email,
          name,
          role: normalizedRole,
          status: normalizedRole === 'interpreter' ? 'pending' : 'active'
        }, { onConflict: 'id' })
    } catch {}

    return NextResponse.json({ success: true, user: data.user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create user' }, { status: 500 })
  }
}


