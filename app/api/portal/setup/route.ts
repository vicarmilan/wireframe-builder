import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Called right after registration to link the new user to their client in Supabase
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const meta = user.publicMetadata as Record<string, string>
  const clientId = meta?.client_id

  if (!clientId) return NextResponse.json({ ok: true, skipped: true })

  const supabase = createServiceClient()

  // Idempotent — insert only if not already linked
  await supabase
    .from('client_users')
    .upsert({ client_id: clientId, user_id: userId }, { onConflict: 'client_id,user_id' })

  return NextResponse.json({ ok: true })
}
