import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const body = await request.json()
  const supabase = createServiceClient()

  const allowed: Record<string, unknown> = {}
  if (body.name !== undefined) allowed.name = body.name
  if (body.slug !== undefined) allowed.slug = body.slug
  if (body.order !== undefined) allowed.order = body.order
  if ('parent_id' in body) allowed.parent_id = body.parent_id ?? null

  const { data, error } = await supabase
    .from('pages')
    .update(allowed)
    .eq('id', pageId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const supabase = createServiceClient()

  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
