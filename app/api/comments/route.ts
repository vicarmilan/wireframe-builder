import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('page_id')
  if (!pageId) return NextResponse.json({ error: 'Missing page_id' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, page_components!inner(page_id)')
    .eq('page_components.page_id', pageId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      page_component_id: body.page_component_id,
      author_id: body.author_id || 'anonymous',
      author_name: body.author_name,
      author_email: body.author_email,
      content: body.content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email notification if configured
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    try {
      // Get project info for the email
      const { data: component } = await supabase
        .from('page_components')
        .select('page_id, pages(project_id, projects(name, client_name))')
        .eq('id', body.page_component_id)
        .single()

      const projectInfo = (component?.pages as { projects?: { name: string; client_name: string } } | null)?.projects
      const projectName = projectInfo?.name ?? 'een project'
      const clientName = projectInfo?.client_name ?? ''
      const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Vicar Builder <noreply@vicaragency.com>',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Nieuwe feedback op ${projectName}${clientName ? ` (${clientName})` : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
            <div style="background: #2563EB; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <span style="color: white; font-weight: bold; font-size: 18px;">Vicar Builder</span>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
              <h2 style="margin: 0 0 8px; font-size: 20px;">Nieuwe feedback ontvangen</h2>
              <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">
                ${body.author_name} heeft feedback achtergelaten op <strong>${projectName}</strong>${clientName ? ` voor ${clientName}` : ''}.
              </p>
              <div style="background: #f9fafb; border-left: 3px solid #2563EB; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 15px; color: #111;">"${body.content}"</p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">${body.author_name} &lt;${body.author_email}&gt;</p>
              </div>
              <a href="${previewUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                Bekijk in dashboard
              </a>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('E-mailmelding sturen mislukt:', emailErr)
    }
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const supabase = createServiceClient()

  // Edit own comment (by author_email)
  if (body.content !== undefined) {
    const { data: existing } = await supabase
      .from('comments').select('author_email').eq('id', body.id).single()
    if (!existing || existing.author_email !== body.author_email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { data, error } = await supabase
      .from('comments')
      .update({ content: body.content, edited_at: new Date().toISOString() })
      .eq('id', body.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Admin: mark resolved
  const { data, error } = await supabase
    .from('comments')
    .update({ resolved: body.resolved })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const authorEmail = searchParams.get('author_email')
  if (!id || !authorEmail) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('comments').select('author_email').eq('id', id).single()
  if (!existing || existing.author_email !== authorEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
