import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if ((user.publicMetadata as Record<string, string>)?.role !== 'admin') return null
  return userId
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = createServiceClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, client_users(user_id)')
    .order('name')

  if (!clients?.length) return NextResponse.json([])

  // Enrich each client_user with Clerk data
  const clerk = await clerkClient()
  const enriched = await Promise.all(
    (clients).map(async (client) => {
      const users = await Promise.all(
        (client.client_users ?? []).map(async (cu: { user_id: string }) => {
          try {
            const u = await clerk.users.getUser(cu.user_id)
            return {
              user_id: cu.user_id,
              email: u.emailAddresses[0]?.emailAddress ?? '',
              name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
              imageUrl: u.imageUrl,
            }
          } catch {
            return { user_id: cu.user_id, email: '', name: null, imageUrl: '' }
          }
        })
      )
      return { ...client, client_users: users }
    })
  )

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('clients').insert({ name }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const supabase = createServiceClient()

  // Add user to client
  if (body.action === 'add-user') {
    const { clientId, userId } = body
    // Remove existing client link first
    await supabase.from('client_users').delete().eq('user_id', userId)
    const { error } = await supabase.from('client_users').insert({ client_id: clientId, user_id: userId })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    // Return enriched user
    const clerk = await clerkClient()
    try {
      const u = await clerk.users.getUser(userId)
      return NextResponse.json({
        user_id: userId,
        email: u.emailAddresses[0]?.emailAddress ?? '',
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        imageUrl: u.imageUrl,
      })
    } catch {
      return NextResponse.json({ user_id: userId, email: '', name: null, imageUrl: '' })
    }
  }

  // Remove user from client
  if (body.action === 'remove-user') {
    const { clientId, userId } = body
    await supabase.from('client_users').delete().eq('client_id', clientId).eq('user_id', userId)
    return NextResponse.json({ ok: true })
  }

  // Update logo_url
  if (body.action === 'set-logo') {
    const { clientId, logo_url } = body
    const { data, error } = await supabase.from('clients').update({ logo_url }).eq('id', clientId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // Rename client
  const { clientId, name } = body
  if (!clientId || !name) return NextResponse.json({ error: 'clientId and name required' }, { status: 400 })
  const { data, error } = await supabase.from('clients').update({ name }).eq('id', clientId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { clientId } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('clients').delete().eq('id', clientId)
  return NextResponse.json({ ok: true })
}
