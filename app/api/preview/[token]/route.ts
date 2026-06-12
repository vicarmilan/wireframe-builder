import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('preview_token', token)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
