import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pageId } = await params
  const supabase = createServiceClient()

  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
