import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
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
      imageUrl: u.imageUrl,
      role: (u.publicMetadata as Record<string, string>)?.role ?? 'client',
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }))
  )
}

export async function PATCH(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, role } = await request.json()
  if (!userId || !['admin', 'client'].includes(role)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, { publicMetadata: { role } })

  return NextResponse.json({ ok: true })
}
