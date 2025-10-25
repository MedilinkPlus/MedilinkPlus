import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// GET: 모든 수수료 조회
export async function GET() {
  try {
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
    
    const { data, error } = await supabase
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


