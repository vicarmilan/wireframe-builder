import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServiceClient()

  // Check if column exists already
  const { error: checkError } = await supabase
    .from('projects')
    .select('status')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({ ok: true, message: 'Column already exists' })
  }

  // Column doesn't exist — update all rows with a dummy column workaround
  // We have to use Supabase's pg REST endpoint
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${url}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: "ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'in_progress';" })
  })

  if (!res.ok) {
    // Try the pg endpoint
    const res2 = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: "ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'in_progress';" })
    })
    const body2 = await res2.text()
    return NextResponse.json({ ok: res2.ok, body: body2 })
  }

  return NextResponse.json({ ok: true })
}
