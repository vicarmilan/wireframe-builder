import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata as Record<string, string>)?.role
  if (role !== 'admin') return null
  return userId
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({ limit: 100, orderBy: '-created_at' })

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? '',
      name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      imageUrl: u.imageUrl,
      role: (u.publicMetadata as Record<string, string>)?.role ?? 'client',
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }))
  )
}

export async function PATCH(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, role, firstName, lastName, clientId, action } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const clerk = await clerkClient()

  if (action === 'signin-link') {
    const token = await clerk.signInTokens.createSignInToken({ userId, expiresInSeconds: 86400 })
    const link = `https://vicar-builder.vercel.app/login?__clerk_ticket=${token.token}`
    return NextResponse.json({ link })
  }

  if (role && ['admin', 'client'].includes(role)) {
    await clerk.users.updateUserMetadata(userId, { publicMetadata: { role } })
  }

  if (firstName !== undefined || lastName !== undefined) {
    const updates: Record<string, string> = {}
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    await clerk.users.updateUser(userId, updates)
  }

  if (clientId !== undefined) {
    const { createServiceClient } = await import('@/lib/supabase')
    const supabase = createServiceClient()
    await supabase.from('client_users').delete().eq('user_id', userId)
    if (clientId) {
      await supabase.from('client_users').insert({ client_id: clientId, user_id: userId })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const callerId = await requireAdmin()
  if (!callerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  if (userId === callerId) return NextResponse.json({ error: 'Je kan jezelf niet verwijderen.' }, { status: 400 })

  const client = await clerkClient()
  await client.users.deleteUser(userId)

  return NextResponse.json({ ok: true })
}
