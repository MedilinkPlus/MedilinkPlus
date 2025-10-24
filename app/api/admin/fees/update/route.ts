import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createServerClient()

    const { data, error } = await (admin as any)
      .from('fees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ fee: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update fee' }, { status: 500 })
  }
}


