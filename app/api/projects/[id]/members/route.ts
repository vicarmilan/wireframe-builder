import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata as Record<string, string>)?.role
  if (role !== 'admin') return null
  return userId
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const supabase = createServiceClient()

  // Get explicit project members
  const { data: members } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', id)

  // Get project client info (split into two queries so a missing column doesn't break everything)
  const { data: projectBase } = await supabase
    .from('projects')
    .select('client_id, clients(id, name)')
    .eq('id', id)
    .single()

  // client_access may not exist yet — query separately so failure is isolated
  const { data: projectAccess } = await supabase
    .from('projects')
    .select('client_access')
    .eq('id', id)
    .single()

  const clerk = await clerkClient()

  type MemberResult = { id: string; user_id: string; email: string; name: string | null; imageUrl: string; via: 'direct' | 'client'; clientName?: string }

  // Enrich explicit members with Clerk info
  const enrichedMembers: MemberResult[] = await Promise.all(
    (members ?? []).map(async (m) => {
      try {
        const user = await clerk.users.getUser(m.user_id)
        return {
          id: m.id,
          user_id: m.user_id,
          email: user.emailAddresses[0]?.emailAddress ?? '',
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          imageUrl: user.imageUrl,
          via: 'direct' as const,
        }
      } catch (err) {
        console.error(`[members] getUser failed for ${m.user_id}:`, err)
        return { id: m.id, user_id: m.user_id, email: '', name: null, imageUrl: '', via: 'direct' as const }
      }
    })
  )

  // Get company members if project has a linked client
  let clientMembers: MemberResult[] = []
  const clientsRaw = projectBase?.clients
  const projectClient = (Array.isArray(clientsRaw) ? clientsRaw[0] : clientsRaw) as { id: string; name: string } | null

  if (projectBase?.client_id && projectClient) {
    const { data: clientUsers } = await supabase
      .from('client_users')
      .select('user_id')
      .eq('client_id', projectBase.client_id)

    const explicitIds = new Set((members ?? []).map((m) => m.user_id))
    clientMembers = await Promise.all(
      (clientUsers ?? [])
        .filter((cu) => !explicitIds.has(cu.user_id))
        .map(async (cu) => {
          try {
            const user = await clerk.users.getUser(cu.user_id)
            return {
              id: cu.user_id,
              user_id: cu.user_id,
              email: user.emailAddresses[0]?.emailAddress ?? '',
              name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
              imageUrl: user.imageUrl,
              via: 'client' as const,
              clientName: projectClient.name,
            }
          } catch (err) {
            console.error(`[members] getUser (client) failed for ${cu.user_id}:`, err)
            return { id: cu.user_id, user_id: cu.user_id, email: '', name: null, imageUrl: '', via: 'client' as const, clientName: projectClient.name }
          }
        })
    )
  }

  return NextResponse.json({
    members: enrichedMembers,
    clientMembers,
    client: projectClient ?? null,
    clientAccess: (projectAccess as { client_access?: boolean } | null)?.client_access ?? true,
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { user_id } = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('project_members')
    .insert({ project_id: id, user_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { user_id } = await request.json()
  const supabase = createServiceClient()

  await supabase
    .from('project_members')
    .delete()
    .eq('project_id', id)
    .eq('user_id', user_id)

  return NextResponse.json({ ok: true })
}
