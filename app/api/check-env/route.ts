import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    hasServiceKey: !!serviceKey,
    urlPrefix: url ? url.substring(0, 20) + '...' : 'missing',
    anonKeyPrefix: anonKey ? anonKey.substring(0, 20) + '...' : 'missing',
    serviceKeyPrefix: serviceKey ? serviceKey.substring(0, 20) + '...' : 'missing'
  })
}

