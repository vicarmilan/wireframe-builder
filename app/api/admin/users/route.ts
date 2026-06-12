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
