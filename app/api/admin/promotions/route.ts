import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const { data, error } = await (supabase.from('promotions') as any).insert(body).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ promotion: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create promotion' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const supabase = createServerClient()
    // updated_at will be auto-updated by trigger
    const { data, error } = await (supabase.from('promotions') as any).update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ promotion: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update promotion' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const supabase = createServerClient()
    const { error } = await (supabase.from('promotions') as any).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete promotion' }, { status: 500 })
  }
}


