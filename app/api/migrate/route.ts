import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// One-time migration endpoint — remove after use
export async function GET() {
  const supabase = createServiceClient()
  const results: string[] = []

  const queries = [
    `create table if not exists clients (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      created_at timestamptz default now()
    )`,
    `create table if not exists client_users (
      id uuid primary key default gen_random_uuid(),
      client_id uuid references clients(id) on delete cascade not null,
      user_id text not null,
      created_at timestamptz default now(),
      unique(client_id, user_id)
    )`,
    `alter table projects add column if not exists client_id uuid references clients(id) on delete set null`,
  ]

  for (const sql of queries) {
    const { error } = await supabase.rpc('exec_sql', { query: sql }).single()
    if (error) {
      // Try direct approach via raw query
      results.push(`Query attempted: ${sql.slice(0, 60)}... — ${error.message}`)
    } else {
      results.push(`OK: ${sql.slice(0, 60)}...`)
    }
  }

  return NextResponse.json({ results })
}
