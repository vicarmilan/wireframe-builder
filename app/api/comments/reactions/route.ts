import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET reactions for a list of comment IDs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('comment_ids')
  if (!ids) return NextResponse.json([])

  const commentIds = ids.split(',')
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('comment_reactions')
    .select('*')
    .in('comment_id', commentIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST toggle a reaction
export async function POST(request: Request) {
  const { comment_id, author_email, author_name, reaction } = await request.json()
  if (!comment_id || !author_email || !reaction) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check if already reacted
  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('id')
    .eq('comment_id', comment_id)
    .eq('author_email', author_email)
    .eq('reaction', reaction)
    .single()

  if (existing) {
    await supabase.from('comment_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ removed: true })
  }

  const { data, error } = await supabase
    .from('comment_reactions')
    .insert({ comment_id, author_email, author_name: author_name || author_email, reaction })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
