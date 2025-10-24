import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

// GET: 모든 수수료 조회
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await (supabase as any)
      .from('fees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    
    return NextResponse.json({ fees: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch fees' }, { status: 500 })
  }
}

// POST: 수수료 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hospital_id, department, treatment, min_price, max_price, currency, duration } = body

    if (!hospital_id || !department || !treatment || !min_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await (supabase as any)
      .from('fees')
      .insert({
        hospital_id,
        department,
        treatment,
        min_price,
        max_price,
        currency: currency || 'USD',
        duration
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ fee: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create fee' }, { status: 500 })
  }
}


