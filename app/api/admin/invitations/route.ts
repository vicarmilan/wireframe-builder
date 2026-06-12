import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await clerkClient()
  const caller = await client.users.getUser(userId)
  if (caller.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Check if user already exists
  const existing = await client.users.getUserList({ emailAddress: [email] })
  if (existing.totalCount > 0) {
    return NextResponse.json({ error: 'Deze gebruiker heeft al een account op het platform.' }, { status: 409 })
  }

  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: role ?? 'client' },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vicar-builder.vercel.app'}/dashboard`,
      ignoreExisting: true,
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const clerkErr = err as { errors?: { message: string }[] }
    const message = clerkErr.errors?.[0]?.message ?? (err instanceof Error ? err.message : 'Onbekende fout')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await clerkClient()
  const caller = await client.users.getUser(userId)
  if (caller.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data } = await client.invitations.getInvitationList({ status: 'pending' })
  return NextResponse.json(data.map((inv) => ({
    id: inv.id,
    email: inv.emailAddress,
    role: (inv.publicMetadata as { role?: string })?.role ?? 'client',
    createdAt: inv.createdAt,
  })))
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await clerkClient()
  const caller = await client.users.getUser(userId)
  if (caller.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { invitationId } = await req.json()
  await client.invitations.revokeInvitation(invitationId)
  return NextResponse.json({ ok: true })
}
