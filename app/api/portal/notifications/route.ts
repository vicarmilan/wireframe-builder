import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Find client for this user
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId)
    .single()

  if (!clientUser) return NextResponse.json([])

  // Get all projects for this client
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, preview_token')
    .eq('client_id', clientUser.client_id)

  if (!projects?.length) return NextResponse.json([])

  const projectIds = projects.map((p) => p.id)

  const { data: pages } = await supabase
    .from('pages')
    .select('id, project_id')
    .in('project_id', projectIds)

  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return NextResponse.json([])

  const { data: components } = await supabase
    .from('page_components')
    .select('id, page_id')
    .in('page_id', pageIds)

  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return NextResponse.json([])

  // Get unread comments by others (not by this user)
  const { data: comments } = await supabase
    .from('comments')
    .select('id, page_component_id, author_name, author_email, author_id, content, created_at')
    .in('page_component_id', componentIds)
    .neq('author_id', userId)
    .is('client_read_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!comments?.length) return NextResponse.json([])

  // Build lookup maps
  const compToPage: Record<string, string> = {}
  const pageToProject: Record<string, string> = {}
  const projectMap: Record<string, { name: string; preview_token: string }> = {}
  ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
  ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })
  projects.forEach((p) => { projectMap[p.id] = { name: p.name, preview_token: p.preview_token } })

  const notifications = comments.map((c) => {
    const pageId = compToPage[c.page_component_id]
    const projectId = pageId ? pageToProject[pageId] : null
    const project = projectId ? projectMap[projectId] : null
    return {
      ...c,
      project_id: projectId,
      project_name: project?.name ?? '',
      preview_token: project?.preview_token ?? '',
    }
  })

  return NextResponse.json(notifications)
}

// Mark all client notifications as read
export async function PATCH() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId)
    .single()

  if (!clientUser) return NextResponse.json({ ok: true })

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', clientUser.client_id)

  const projectIds = (projects ?? []).map((p) => p.id)
  if (!projectIds.length) return NextResponse.json({ ok: true })

  const { data: pages } = await supabase
    .from('pages')
    .select('id')
    .in('project_id', projectIds)

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
    .update({ client_read_at: new Date().toISOString() })
    .in('page_component_id', componentIds)
    .neq('author_id', userId)
    .is('client_read_at', null)

  return NextResponse.json({ ok: true })
}
