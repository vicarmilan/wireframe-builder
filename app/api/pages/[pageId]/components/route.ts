import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('page_components')
    .select('*')
    .eq('page_id', pageId)
    .order('order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const body = await request.json()
  const supabase = createServiceClient()

  let insertOrder: number
  if (body.order !== undefined) {
    insertOrder = body.order
  } else {
    const { data: existing } = await supabase
      .from('page_components')
      .select('order')
      .eq('page_id', pageId)
      .order('order', { ascending: false })
      .limit(1)
    insertOrder = existing && existing.length > 0 ? existing[0].order + 1 : 0
  }

  const { data, error } = await supabase
    .from('page_components')
    .insert({
      page_id: pageId,
      component_type: body.component_type,
      component_variant: body.component_variant,
      order: insertOrder,
      props: body.props || {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createServiceClient()

  // bulk reorder
  if (body.reorder) {
    const updates = body.reorder.map((item: { id: string; order: number }) =>
      supabase.from('page_components').update({ order: item.order }).eq('id', item.id)
    )
    await Promise.all(updates)
    return NextResponse.json({ ok: true })
  }

  // update single component props
  const { data, error } = await supabase
    .from('page_components')
    .update({ props: body.props })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('page_components').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
