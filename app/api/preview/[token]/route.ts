import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('preview_token', token)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check access: admin or project member
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata as Record<string, string>)?.role
  const isAdmin = role === 'admin'

  if (!isAdmin) {
    const { data: membership } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', userId)
      .single()

    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .order('order', { ascending: true })

  const { data: components } = await supabase
    .from('page_components')
    .select('*')
    .in('page_id', (pages ?? []).map((p) => p.id))
    .order('order', { ascending: true })

  const pagesWithComponents = (pages ?? []).map((page) => ({
    ...page,
    page_components: (components ?? []).filter((c) => c.page_id === page.id),
  }))

  return NextResponse.json({ ...project, pages: pagesWithComponents })
}
