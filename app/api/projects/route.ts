import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateToken } from '@/lib/utils'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!projects?.length) return NextResponse.json([])

  // Get unread comment counts per project
  const projectIds = projects.map((p) => p.id)

  const { data: pages } = await supabase
    .from('pages')
    .select('id, project_id')
    .in('project_id', projectIds)

  const pageIds = (pages ?? []).map((p) => p.id)

  let unreadByProject: Record<string, number> = {}

  if (pageIds.length > 0) {
    const { data: components } = await supabase
      .from('page_components')
      .select('id, page_id')
      .in('page_id', pageIds)

    const componentIds = (components ?? []).map((c) => c.id)

    if (componentIds.length > 0) {
      const { data: unread } = await supabase
        .from('comments')
        .select('page_component_id')
        .in('page_component_id', componentIds)
        .is('read_at', null)

      // Map component -> page -> project
      const compToPage: Record<string, string> = {}
      const pageToProject: Record<string, string> = {}
      ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
      ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })

      ;(unread ?? []).forEach((c) => {
        const pageId = compToPage[c.page_component_id]
        const projectId = pageId ? pageToProject[pageId] : null
        if (projectId) unreadByProject[projectId] = (unreadByProject[projectId] || 0) + 1
      })
    }
  }

  const result = projects.map((p) => ({ ...p, unread_comments: unreadByProject[p.id] || 0 }))
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createServiceClient()

  // Resolve client_name from client_id
  let clientName = body.client_name ?? ''
  if (body.client_id) {
    const { data: clientRecord } = await supabase
      .from('clients')
      .select('name')
      .eq('id', body.client_id)
      .single()
    if (clientRecord) clientName = clientRecord.name
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: body.name,
      client_name: clientName,
      client_id: body.client_id ?? null,
      owner_id: userId,
      preview_token: generateToken(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
