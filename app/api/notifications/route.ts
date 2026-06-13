import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_name, preview_token')
    .eq('owner_id', userId)

  if (!projects?.length) return NextResponse.json([])

  // Get admin's own email to exclude their own reactions
  const clerk = await clerkClient()
  const adminUser = await clerk.users.getUser(userId)
  const adminEmail = adminUser.emailAddresses[0]?.emailAddress ?? ''

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

  // Build lookup maps
  const compToPage: Record<string, string> = {}
  const pageToProject: Record<string, string> = {}
  const projectMap: Record<string, { name: string; client_name: string; preview_token: string }> = {}
  ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
  ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })
  projects.forEach((p) => { projectMap[p.id] = { name: p.name, client_name: p.client_name, preview_token: p.preview_token } })

  // Fetch unread comments
  const { data: comments } = await supabase
    .from('comments')
    .select('id, page_component_id, author_name, author_email, content, created_at')
    .in('page_component_id', componentIds)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch unread reactions by others (not the admin themselves)
  const { data: reactions } = await supabase
    .from('comment_reactions')
    .select('id, comment_id, author_name, author_email, reaction, created_at, comments(page_component_id, content)')
    .is('admin_read_at', null)
    .neq('author_email', adminEmail)
    .order('created_at', { ascending: false })
    .limit(50)

  const enriched = (item: { page_component_id: string }) => {
    const pageId = compToPage[item.page_component_id]
    const projectId = pageId ? pageToProject[pageId] : null
    const project = projectId ? projectMap[projectId] : null
    return { pageId, projectId, project }
  }

  const commentNotifs = (comments ?? []).map((c) => {
    const { pageId, projectId, project } = enriched(c)
    return {
      id: `comment-${c.id}`,
      type: 'comment' as const,
      page_component_id: c.page_component_id,
      author_name: c.author_name,
      author_email: c.author_email,
      content: c.content,
      created_at: c.created_at,
      page_id: pageId ?? null,
      project_id: projectId,
      project_name: project?.name ?? '',
      client_name: project?.client_name ?? '',
      preview_token: project?.preview_token ?? '',
    }
  })

  const reactionNotifs = (reactions ?? [])
    .filter((r) => {
      const comment = r.comments as unknown as { page_component_id: string; content: string } | null
      return comment && componentIds.includes(comment.page_component_id)
    })
    .map((r) => {
      const comment = r.comments as unknown as { page_component_id: string; content: string }
      const { pageId, projectId, project } = enriched(comment)
      return {
        id: `reaction-${r.id}`,
        type: 'reaction' as const,
        page_component_id: comment.page_component_id,
        author_name: r.author_name || r.author_email,
        author_email: r.author_email,
        reaction: r.reaction,
        comment_preview: comment.content,
        created_at: r.created_at,
        page_id: pageId ?? null,
        project_id: projectId,
        project_name: project?.name ?? '',
        client_name: project?.client_name ?? '',
        preview_token: project?.preview_token ?? '',
      }
    })

  const all = [...commentNotifs, ...reactionNotifs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json(all)
}

// Mark all as read
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', userId)
    .single()

  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: pages } = await supabase.from('pages').select('id').eq('project_id', projectId)
  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return NextResponse.json({ ok: true })

  const { data: components } = await supabase.from('page_components').select('id').in('page_id', pageIds)
  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return NextResponse.json({ ok: true })

  const now = new Date().toISOString()

  await supabase
    .from('comments')
    .update({ read_at: now })
    .in('page_component_id', componentIds)
    .is('read_at', null)

  // Mark reactions read via comment join
  const { data: commentsInProject } = await supabase
    .from('comments')
    .select('id')
    .in('page_component_id', componentIds)

  const commentIds = (commentsInProject ?? []).map((c) => c.id)
  if (commentIds.length) {
    await supabase
      .from('comment_reactions')
      .update({ admin_read_at: now })
      .in('comment_id', commentIds)
      .is('admin_read_at', null)
  }

  return NextResponse.json({ ok: true })
}
