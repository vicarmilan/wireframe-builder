import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Get all unread notifications across all projects
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_name')
    .eq('owner_id', userId)

  if (!projects?.length) return NextResponse.json([])

  const projectIds = projects.map((p) => p.id)

  const { data: pages } = await supabase
    .from('pages')
    .select('id, project_id, name')
    .in('project_id', projectIds)

  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return NextResponse.json([])

  const { data: components } = await supabase
    .from('page_components')
    .select('id, page_id, component_type')
    .in('page_id', pageIds)

  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return NextResponse.json([])

  const { data: comments } = await supabase
    .from('comments')
    .select('id, page_component_id, author_name, author_email, content, created_at')
    .in('page_component_id', componentIds)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!comments?.length) return NextResponse.json([])

  // Build lookup maps
  const compToPage: Record<string, string> = {}
  const pageToProject: Record<string, string> = {}
  const projectMap: Record<string, { name: string; client_name: string }> = {}
  ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
  ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })
  projects.forEach((p) => { projectMap[p.id] = { name: p.name, client_name: p.client_name } })

  const notifications = comments.map((c) => {
    const pageId = compToPage[c.page_component_id]
    const projectId = pageId ? pageToProject[pageId] : null
    const project = projectId ? projectMap[projectId] : null
    return {
      ...c,
      project_id: projectId,
      project_name: project?.name ?? '',
      client_name: project?.client_name ?? '',
    }
  })

  return NextResponse.json(notifications)
}

// Mark all unread comments for a project as read
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = createServiceClient()

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', userId)
    .single()

  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get all page_component IDs for this project
  const { data: pages } = await supabase
    .from('pages')
    .select('id')
    .eq('project_id', projectId)

  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return NextResponse.json({ ok: true })

  const { data: components } = await supabase
    .from('page_components')
    .select('id')
    .in('page_id', pageIds)

  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return NextResponse.json({ ok: true })

  await supabase
    .from('comments')
    .update({ read_at: new Date().toISOString() })
    .in('page_component_id', componentIds)
    .is('read_at', null)

  return NextResponse.json({ ok: true })
}
