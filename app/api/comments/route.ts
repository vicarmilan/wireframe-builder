import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      page_component_id: body.page_component_id,
      author_id: body.author_id || 'anonymous',
      author_name: body.author_name,
      author_email: body.author_email,
      content: body.content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('comments')
    .update({ resolved: body.resolved })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
