import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, pages(*, page_components(*))')
    .eq('preview_token', token)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}
