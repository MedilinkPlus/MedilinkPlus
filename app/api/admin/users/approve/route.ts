import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createServerClient()

    // Set role=interpreter and status=active
    const { error: profErr } = await admin
      .from('profiles')
      .update({ role: 'interpreter', status: 'active' })
      .eq('id', id)
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 })

    // Sync to auth metadata
    const { error: authErr } = await (admin as any).auth.admin.updateUserById(id, {
      user_metadata: { role: 'interpreter' }
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to approve interpreter' }, { status: 500 })
  }
}




