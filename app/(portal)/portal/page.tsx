'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Layout, Clock, Lock, MessageCircle, CheckCircle2, Bell, X } from 'lucide-react'
import { Project, PageComponent, ProjectStatus } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

interface PortalNotification {
  id: string
  type: 'comment' | 'reaction'
  page_component_id: string
  author_name: string
  content?: string
  reaction?: string
  comment_preview?: string
  created_at: string
  project_name: string
  preview_token: string
}

const REACTION_EMOJI: Record<string, string> = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  check: '✅',
}

const PREVIEW_INNER_WIDTH = 1280
const PREVIEW_HEIGHT = 180

function CardPreview({ previewToken }: { previewToken: string }) {
  const [components, setComponents] = useState<PageComponent[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  useEffect(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / PREVIEW_INNER_WIDTH)
    }
  }, [])

  useEffect(() => {
    fetch(`/api/preview/${previewToken}`)
      .then((r) => r.ok ? r.json() : null)
      .then((project) => {
        if (!project?.pages?.length) { setComponents([]); return }
        const firstPage = project.pages.sort((a: { order: number }, b: { order: number }) => a.order - b.order)[0]
        const sorted = (firstPage.page_components ?? []).sort((a: PageComponent, b: PageComponent) => a.order - b.order)
        setComponents(sorted.slice(0, 5))
      })
      .catch(() => setComponents([]))
  }, [previewToken])

  if (components === null) {
    return <div ref={containerRef} className="skeleton w-full" style={{ height: PREVIEW_HEIGHT }} />
  }

  if (components.length === 0) {
    return (
      <div ref={containerRef} className="w-full bg-gray-50 flex items-center justify-center text-gray-300 text-xs" style={{ height: PREVIEW_HEIGHT }}>
        Geen componenten
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ height: PREVIEW_HEIGHT, overflow: 'hidden', position: 'relative', background: 'white' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: PREVIEW_INNER_WIDTH,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {components.map((comp) => (
          <WireframeComponent key={comp.id} component={comp} editing={false} onPropChange={() => {}} />
        ))}
      </div>
    </div>
  )
}

interface PortalData {
  projects: Project[]
  client: { id: string; name: string } | null
}

export default function PortalPage() {
  const { user } = useUser()
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/portal/projects')
      .then((r) => r.ok ? r.json() : { projects: [], client: null })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setData({ projects: [], client: null }); setLoading(false) })
    fetch('/api/portal/notifications')
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAllRead() {
    await fetch('/api/portal/notifications', { method: 'PATCH' })
    setNotifications([])
    setShowNotifs(false)
  }

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || ''

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            {data?.client?.name ?? 'Mijn projecten'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifs((v) => !v)}
              className="relative flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-sm text-gray-900">
                    Meldingen {notifications.length > 0 && <span className="text-gray-400 font-normal">({notifications.length})</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Alles gelezen
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">
                      <Bell size={24} className="mx-auto mb-2 text-gray-200" />
                      Geen nieuwe meldingen
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={`/preview/${n.preview_token}#feedback-panel-${n.page_component_id}`}
                        onClick={() => setShowNotifs(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 group"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
                            {n.author_name.charAt(0).toUpperCase()}
                          </div>
                          {n.type === 'reaction' && (
                            <span className="absolute -bottom-1 -right-1 text-sm leading-none">
                              {REACTION_EMOJI[n.reaction ?? ''] ?? '👍'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-gray-900">{n.author_name}</span>
                            <span className="text-xs text-gray-400">
                              {n.type === 'reaction' ? 'reageerde op' : 'op'}
                            </span>
                            <span className="text-xs font-medium text-blue-600 truncate group-hover:underline">{n.project_name}</span>
                          </div>
                          {n.type === 'reaction' && n.comment_preview && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">&ldquo;{n.comment_preview}&rdquo;</p>
                          )}
                          {n.type === 'comment' && (
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.content}</p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <UserButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="skeleton w-10 h-10 rounded-xl mb-4" />
                <div className="skeleton h-4 w-2/5 mb-2" />
                <div className="skeleton h-3 w-1/4 mb-5" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))}
          </div>
        ) : !data?.projects.length ? (
          <EmptyState name={firstName} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                Goeiedag{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.projects.length === 1
                  ? 'Hier is je project.'
                  : `Je hebt ${data.projects.length} projecten.`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status, clientAccess }: { status: ProjectStatus; clientAccess?: boolean }) {
  if (clientAccess === false || status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        <Lock size={10} />
        In ontwikkeling
      </span>
    )
  }
  if (status === 'pending_review') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
        <MessageCircle size={10} />
        Wachten op feedback
      </span>
    )
  }
  if (status === 'feedback') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
        <MessageCircle size={10} />
        Feedback in behandeling
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={10} />
      Goedgekeurd
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const status = project.status ?? 'in_progress'
  const clientAccess = (project as Project & { client_access?: boolean }).client_access
  const isLocked = status === 'in_progress' || clientAccess === false

  const cardContent = (
    <>
      <div className="border-b border-gray-100 relative overflow-hidden">
        <div className={isLocked ? 'blur-sm scale-105' : ''}>
          <CardPreview previewToken={project.preview_token} />
        </div>
        {isLocked && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
            <Lock size={24} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <StatusBadge status={status} clientAccess={(project as Project & { client_access?: boolean }).client_access} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{project.name}</h3>
        <p className="text-xs text-gray-400">{project.client_name}</p>
        {!isLocked && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-300">
            <Clock size={11} />
            {new Date(project.updated_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
    </>
  )

  if (isLocked) {
    return (
      <div className="block bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-80 cursor-default">
        {cardContent}
      </div>
    )
  }

  return (
    <Link
      href={`/preview/${project.preview_token}`}
      className="block bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all overflow-hidden"
    >
      {cardContent}
    </Link>
  )
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Layout size={24} className="text-gray-300" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Welkom{name ? `, ${name}` : ''}!
      </h2>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Er zijn nog geen projecten voor jou klaargemaakt. Het Vicar team werkt eraan.
      </p>
    </div>
  )
}
