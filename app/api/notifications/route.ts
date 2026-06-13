import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

async function getAdminContext(userId: string) {
  const supabase = createServiceClient()
  const clerk = await clerkClient()
  const adminUser = await clerk.users.getUser(userId)
  const adminEmail = adminUser.emailAddresses[0]?.emailAddress ?? ''

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_name, preview_token')
    .eq('owner_id', userId)

  if (!projects?.length) return null

  const projectIds = projects.map((p) => p.id)
  const { data: pages } = await supabase.from('pages').select('id, project_id').in('project_id', projectIds)
  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return null

  const { data: components } = await supabase.from('page_components').select('id, page_id').in('page_id', pageIds)
  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return null

  const compToPage: Record<string, string> = {}
  const pageToProject: Record<string, string> = {}
  const projectMap: Record<string, { name: string; client_name: string; preview_token: string }> = {}
  ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
  ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })
  projects.forEach((p) => { projectMap[p.id] = { name: p.name, client_name: p.client_name, preview_token: p.preview_token } })

  return { supabase, adminEmail, componentIds, compToPage, pageToProject, projectMap }
}

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'

  const ctx = await getAdminContext(userId)
  if (!ctx) return NextResponse.json([])

  const { supabase, adminEmail, componentIds, compToPage, pageToProject, projectMap } = ctx

  const enriched = (item: { page_component_id: string }) => {
    const pageId = compToPage[item.page_component_id]
    const projectId = pageId ? pageToProject[pageId] : null
    const project = projectId ? projectMap[projectId] : null
    return { pageId, projectId, project }
  }

  // Fetch comments by others (not the admin themselves)
  let commentQuery = supabase
    .from('comments')
    .select('id, page_component_id, author_name, author_email, content, created_at, read_at')
    .in('page_component_id', componentIds)
    .neq('author_email', adminEmail)
    .order('created_at', { ascending: false })
    .limit(100)
  if (!all) commentQuery = commentQuery.is('read_at', null)

  const { data: comments } = await commentQuery

  // Fetch reactions
  let reactionQuery = supabase
    .from('comment_reactions')
    .select('id, comment_id, author_name, author_email, reaction, created_at, admin_read_at, comments(page_component_id, content)')
    .neq('author_email', adminEmail)
    .order('created_at', { ascending: false })
    .limit(100)
  if (!all) reactionQuery = reactionQuery.is('admin_read_at', null)

  const { data: reactions } = await reactionQuery

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
      read_at: c.read_at ?? null,
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
        read_at: r.admin_read_at ?? null,
        page_id: pageId ?? null,
        project_id: projectId,
        project_name: project?.name ?? '',
        client_name: project?.client_name ?? '',
        preview_token: project?.preview_token ?? '',
      }
    })

  const result = [...commentNotifs, ...reactionNotifs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json(result)
}

// Mark one or all notifications as read
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { notifId?: string } = {}
  try { body = await request.json() } catch { /* empty body = mark all */ }

  const ctx = await getAdminContext(userId)
  if (!ctx) return NextResponse.json({ ok: true })

  const { supabase, componentIds } = ctx
  const now = new Date().toISOString()

  // Mark single notification
  if (body.notifId) {
    const [type, rawId] = body.notifId.split(/-(.+)/)
    if (type === 'comment') {
      await supabase.from('comments').update({ read_at: now }).eq('id', rawId)
    } else if (type === 'reaction') {
      await supabase.from('comment_reactions').update({ admin_read_at: now }).eq('id', rawId)
    }
    return NextResponse.json({ ok: true })
  }

  // Mark all as read
  await supabase
    .from('comments')
    .update({ read_at: now })
    .in('page_component_id', componentIds)
    .is('read_at', null)

  const { data: commentsAll } = await supabase
    .from('comments')
    .select('id')
    .in('page_component_id', componentIds)

  const commentIds = (commentsAll ?? []).map((c) => c.id)
  if (commentIds.length) {
    await supabase
      .from('comment_reactions')
      .update({ admin_read_at: now })
      .in('comment_id', commentIds)
      .is('admin_read_at', null)
  }

  return NextResponse.json({ ok: true })
}
