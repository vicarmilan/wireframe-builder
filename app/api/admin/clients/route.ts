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
  const { data } = await supabase
    .from('clients')
    .select('*, client_users(user_id)')
    .order('name')
  return NextResponse.json(data ?? [])
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

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { clientId } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('clients').delete().eq('id', clientId)
  return NextResponse.json({ ok: true })
}
