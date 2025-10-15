import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  try {
    // Direct fetch test to Supabase REST API
    const testUrl = `${url}/rest/v1/`
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    })

    const text = await response.text()
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: testUrl,
      responsePreview: text.substring(0, 200)
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      code: err.code,
      cause: err.cause?.message || null,
      stack: err.stack?.split('\n').slice(0, 3)
    }, { status: 500 })
  }
}

