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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = getSupabaseClient()

    // 1) Delete from public.profiles first (if exists)
    let profileDeleted = false
    try {
      const { error: delProfileErr } = await admin.from('profiles').delete().eq('id', id)
      if (!delProfileErr || delProfileErr.code === 'PGRST116' || delProfileErr.message?.includes('0 rows')) {
        profileDeleted = true
      }
    } catch {}

    // 2) Delete auth user (ignore if not found)
    let authDeleted = false
    try {
      const { error: delAuthErr } = await admin.auth.admin.deleteUser(id)
      if (!delAuthErr || delAuthErr.message?.toLowerCase().includes('not found')) {
        authDeleted = true
      }
    } catch {}

    return NextResponse.json({ success: true, details: { profileDeleted, authDeleted } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 })
  }
}


