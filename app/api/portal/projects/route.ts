import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  try {
    // Find which client this user belongs to
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id, clients(id, name)')
      .eq('user_id', userId)
      .single()

    if (!clientUser) return NextResponse.json({ projects: [], client: null })

    // Get all projects for this client
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, client_name, logo_url, preview_token, created_at, updated_at')
      .eq('client_id', clientUser.client_id)
      .order('updated_at', { ascending: false })

    return NextResponse.json({ projects: projects ?? [], client: clientUser.clients })
  } catch {
    return NextResponse.json({ projects: [], client: null })
  }
}
