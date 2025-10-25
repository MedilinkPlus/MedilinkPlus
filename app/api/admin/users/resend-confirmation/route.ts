import { NextResponse } from 'next/server'
import { createServerClient } from '@/supabase/supabaseClient'

export async function POST(request: Request) {
  try {
    const { id, redirectTo } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createServerClient()

    // Find auth user by id
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 400 })
    const user = list?.users?.find(u => u.id === id)
    if (!user) return NextResponse.json({ error: 'User not found in auth' }, { status: 404 })

    const email = user.email as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof process !== 'undefined' ? '' : '')
    const redirect = redirectTo || (siteUrl ? `${siteUrl}/auth/login` : undefined)

    // Try sending an invite (some projects use invites as confirmation)
    try {
      await (admin as any).auth.admin.inviteUserByEmail(email, { redirectTo: redirect } as any)
    } catch {}

    // Always generate a fresh confirmation/signup link as fallback (returned to admin)
    const { data: linkData, error: linkErr } = await (admin as any).auth.admin.generateLink({
      type: 'signup',
      email,
      options: redirect ? { redirectTo: redirect } : undefined
    })
    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 })

    return NextResponse.json({ success: true, email, link: (linkData as any)?.properties?.action_link || (linkData as any)?.action_link })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to resend confirmation' }, { status: 500 })
  }
}




