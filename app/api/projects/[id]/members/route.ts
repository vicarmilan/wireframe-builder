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

  const { data: members } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', id)

  if (!members) return NextResponse.json([])

  // Enrich with Clerk user info
  const client = await clerkClient()
  const enriched = await Promise.all(
    members.map(async (m) => {
      try {
        const user = await client.users.getUser(m.user_id)
        return {
          id: m.id,
          user_id: m.user_id,
          email: user.emailAddresses[0]?.emailAddress ?? '',
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
          imageUrl: user.imageUrl,
        }
      } catch {
        return { id: m.id, user_id: m.user_id, email: '', name: null, imageUrl: '' }
      }
    })
  )

  return NextResponse.json(enriched)
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
