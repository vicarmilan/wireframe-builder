import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId)
    .single()

  if (!clientUser) return NextResponse.json([])

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

  const compToPage: Record<string, string> = {}
  const pageToProject: Record<string, string> = {}
  const projectMap: Record<string, { name: string; preview_token: string }> = {}
  ;(components ?? []).forEach((c) => { compToPage[c.id] = c.page_id })
  ;(pages ?? []).forEach((p) => { pageToProject[p.id] = p.project_id })
  projects.forEach((p) => { projectMap[p.id] = { name: p.name, preview_token: p.preview_token } })

  const enriched = (pageComponentId: string) => {
    const pageId = compToPage[pageComponentId]
    const projectId = pageId ? pageToProject[pageId] : null
    const project = projectId ? projectMap[projectId] : null
    return { projectId, project }
  }

  // Unread comments by others
  const { data: comments } = await supabase
    .from('comments')
    .select('id, page_component_id, author_name, author_email, author_id, content, created_at')
    .in('page_component_id', componentIds)
    .neq('author_id', userId)
    .is('client_read_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  // Unread reactions on comments in this client's projects by others
  const { data: commentsAll } = await supabase
    .from('comments')
    .select('id, page_component_id, content')
    .in('page_component_id', componentIds)

  const commentIds = (commentsAll ?? []).map((c) => c.id)
  const commentMap: Record<string, { page_component_id: string; content: string }> = {}
  ;(commentsAll ?? []).forEach((c) => { commentMap[c.id] = c })

  const { data: reactions } = commentIds.length
    ? await supabase
        .from('comment_reactions')
        .select('id, comment_id, author_name, author_email, reaction, created_at')
        .in('comment_id', commentIds)
        .neq('author_email', '') // exclude empty
        .is('client_read_at', null)
        .order('created_at', { ascending: false })
        .limit(30)
    : { data: [] }

  const commentNotifs = (comments ?? []).map((c) => {
    const { projectId, project } = enriched(c.page_component_id)
    return {
      id: `comment-${c.id}`,
      type: 'comment' as const,
      page_component_id: c.page_component_id,
      author_name: c.author_name,
      author_email: c.author_email,
      content: c.content,
      created_at: c.created_at,
      project_id: projectId,
      project_name: project?.name ?? '',
      preview_token: project?.preview_token ?? '',
    }
  })

  const reactionNotifs = (reactions ?? [])
    .filter((r) => {
      const comment = commentMap[r.comment_id]
      return comment && componentIds.includes(comment.page_component_id)
    })
    .map((r) => {
      const comment = commentMap[r.comment_id]
      const { projectId, project } = enriched(comment.page_component_id)
      return {
        id: `reaction-${r.id}`,
        type: 'reaction' as const,
        page_component_id: comment.page_component_id,
        author_name: r.author_name || r.author_email,
        author_email: r.author_email,
        reaction: r.reaction,
        comment_preview: comment.content,
        created_at: r.created_at,
        project_id: projectId,
        project_name: project?.name ?? '',
        preview_token: project?.preview_token ?? '',
      }
    })

  const all = [...commentNotifs, ...reactionNotifs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json(all)
}

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

  const { data: pages } = await supabase.from('pages').select('id').in('project_id', projectIds)
  const pageIds = (pages ?? []).map((p) => p.id)
  if (!pageIds.length) return NextResponse.json({ ok: true })

  const { data: components } = await supabase.from('page_components').select('id').in('page_id', pageIds)
  const componentIds = (components ?? []).map((c) => c.id)
  if (!componentIds.length) return NextResponse.json({ ok: true })

  const now = new Date().toISOString()

  await supabase
    .from('comments')
    .update({ client_read_at: now })
    .in('page_component_id', componentIds)
    .neq('author_id', userId)
    .is('client_read_at', null)

  const { data: commentsAll } = await supabase
    .from('comments')
    .select('id')
    .in('page_component_id', componentIds)

  const commentIds = (commentsAll ?? []).map((c) => c.id)
  if (commentIds.length) {
    await supabase
      .from('comment_reactions')
      .update({ client_read_at: now })
      .in('comment_id', commentIds)
      .is('client_read_at', null)
  }

  return NextResponse.json({ ok: true })
}
