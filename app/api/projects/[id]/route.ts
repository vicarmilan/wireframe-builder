import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('owner_id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const supabase = createServiceClient()

  const allowed: Record<string, unknown> = {}
  if (body.name !== undefined) allowed.name = body.name
  if (body.logo_url !== undefined) allowed.logo_url = body.logo_url
  if (body.client_access !== undefined) allowed.client_access = body.client_access

  // client_id drives client_name — fetch name from clients table when set
  if (body.client_id !== undefined) {
    allowed.client_id = body.client_id || null
    if (body.client_id) {
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('name')
        .eq('id', body.client_id)
        .single()
      if (clientRecord) allowed.client_name = clientRecord.name
    } else {
      // Explicitly clearing client
      allowed.client_name = body.client_name ?? null
    }
  } else if (body.client_name !== undefined) {
    allowed.client_name = body.client_name
  }

  const { data, error } = await supabase
    .from('projects')
    .update(allowed)
    .eq('id', id)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
