import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

async function requireAdmin(userId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  return (user.publicMetadata as Record<string, string>)?.role === 'admin'
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role, clientId, newClientName } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const clerk = await clerkClient()

  // Check if user already exists
  const existing = await clerk.users.getUserList({ emailAddress: [email] })
  if (existing.totalCount > 0) {
    return NextResponse.json({ error: 'Deze gebruiker heeft al een account op het platform.' }, { status: 409 })
  }

  // Create or resolve client in Supabase for client-role invites
  let resolvedClientId: string | null = null
  if (role === 'client' || !role) {
    const supabase = createServiceClient()
    if (clientId && clientId !== 'new') {
      resolvedClientId = clientId
    } else if (newClientName) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ name: newClientName })
        .select()
        .single()
      resolvedClientId = newClient?.id ?? null
    }
  }

  try {
    await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role ?? 'client',
        ...(resolvedClientId ? { client_id: resolvedClientId } : {}),
      },
      redirectUrl: 'https://vicar-builder.vercel.app/register',
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
  if (!await requireAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const client = await clerkClient()
  const { data } = await client.invitations.getInvitationList({ status: 'pending' })
  return NextResponse.json(data.map((inv) => ({
    id: inv.id,
    email: inv.emailAddress,
    role: (inv.publicMetadata as { role?: string })?.role ?? 'client',
    clientId: (inv.publicMetadata as { client_id?: string })?.client_id ?? null,
    createdAt: inv.createdAt,
  })))
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { invitationId } = await req.json()
  if (!invitationId) return NextResponse.json({ error: 'invitationId required' }, { status: 400 })

  const clerk = await clerkClient()

  // Get existing invitation details
  const { data: pending } = await clerk.invitations.getInvitationList({ status: 'pending' })
  const inv = pending.find((i) => i.id === invitationId)
  if (!inv) return NextResponse.json({ error: 'Uitnodiging niet gevonden' }, { status: 404 })

  // Revoke old invitation
  await clerk.invitations.revokeInvitation(invitationId)

  // Create new invitation with same parameters
  try {
    await clerk.invitations.createInvitation({
      emailAddress: inv.emailAddress,
      publicMetadata: inv.publicMetadata as Record<string, unknown>,
      redirectUrl: 'https://vicar-builder.vercel.app/register',
      ignoreExisting: true,
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const clerkErr = err as { errors?: { message: string }[] }
    const message = clerkErr.errors?.[0]?.message ?? 'Kon uitnodiging niet opnieuw versturen'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { invitationId } = await req.json()
  const client = await clerkClient()
  await client.invitations.revokeInvitation(invitationId)
  return NextResponse.json({ ok: true })
}
