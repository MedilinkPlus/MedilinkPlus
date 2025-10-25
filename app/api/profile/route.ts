import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, name, phone, role = 'user', avatar_url = null } = body || {}
    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = getSupabaseClient()
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


