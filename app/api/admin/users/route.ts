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

export async function GET() {
  try {
    const admin = getSupabaseClient()
    // 1) Fetch auth users
    const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    // 2) Fetch public profiles
    const { data: profiles, error: profErr } = await (admin
      .from('profiles') as any)
      .select('*')
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 })

    const idToProfile = new Map<string, any>(((profiles as any[]) || []).map(p => [p.id, p]))

    // 3) Merge: union of auth.users and public.users (profiles)
    const authUsers = (authList?.users || []).map(u => {
      const prof = idToProfile.get(u.id)
      return {
        id: u.id,
        email: (prof?.email || u.email || ''),
        role: (prof?.role || (u.user_metadata as any)?.role || 'user'),
        name: (prof?.name || (u.user_metadata as any)?.name || ''),
        status: (prof?.status || 'active'),
        created_at: prof?.created_at || u.created_at,
        updated_at: prof?.updated_at || u.updated_at
      }
    })

    const authIdSet = new Set<string>(authUsers.map(u => u.id))
    const profileOnlyUsers = ((profiles as any[]) || [])
      .filter((p: any) => !authIdSet.has(p.id))
      .map((p: any) => ({
        id: p.id,
        email: p.email,
        role: p.role || 'user',
        name: p.name || '',
        status: p.status || 'active',
        created_at: p.created_at,
        updated_at: p.updated_at
      }))

    const users = [...authUsers, ...profileOnlyUsers]

    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list users' }, { status: 500 })
  }
}


