import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createServerClient()

    const { error } = await (admin as any)
      .from('fees')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete fee' }, { status: 500 })
  }
}


