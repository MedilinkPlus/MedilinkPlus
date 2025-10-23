import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, name, phone, role = 'user', avatar_url = null } = body || {}
    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createServerClient()
    // Upsert profile row with service role to bypass RLS safely
    const { data, error } = await (admin
      .from('users') as any)
      .upsert({ id, email, name, phone: phone || '', role, avatar_url }, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upsert profile' }, { status: 500 })
  }
}


