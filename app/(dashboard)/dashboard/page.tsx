'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, FolderOpen, MessageSquare, Clock, Pencil, Eye, Link2, Trash2, AlertTriangle, Users, Building2, Bell, X, Lock, MessageCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, PageComponent, ProjectStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import NewProjectModal from '@/components/editor/NewProjectModal'
import EditProjectModal from '@/components/editor/EditProjectModal'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

interface Notification {
  id: string
  page_component_id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
  project_id: string
  project_name: string
  client_name: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : [])
        setLoading(false)
      })
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function onCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    setShowNew(false)
  }

  function onUpdated(updated: Project) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditProject(null)
  }

  function onDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setEditProject(null)
  }

  function onMarkRead(id: string) {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, unread_comments: 0 } : p))
    setNotifications((prev) => prev.filter((n) => n.project_id !== id))
  }

  async function markAllRead() {
    const projectIds = [...new Set(notifications.map((n) => n.project_id))]
    await Promise.all(projectIds.map((projectId) =>
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
    ))
    setNotifications([])
    setProjects((prev) => prev.map((p) => ({ ...p, unread_comments: 0 })))
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Vicar Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/clients" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Building2 size={15} />
            Bedrijven
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Users size={15} />
            Gebruikers
          </Link>

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifs((v) => !v)}
              className="relative flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
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
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
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
                      <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
                          {n.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-gray-900">{n.author_name}</span>
                            <span className="text-xs text-gray-400">op</span>
                            <span className="text-xs font-medium text-blue-600 truncate">{n.project_name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.content}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nieuw project
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Projecten</h1>
        <p className="text-gray-500 mb-8">Alle wireframe projecten voor jouw klanten</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="skeleton w-10 h-10 rounded-lg mb-4" />
                <div className="skeleton h-4 w-3/5 mb-2" />
                <div className="skeleton h-3 w-2/5 mb-6" />
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
            <FolderOpen size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Nog geen projecten</p>
            <p className="text-gray-400 text-sm mt-1">Maak je eerste project aan</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-6 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Project aanmaken
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditProject(project)}
                onMarkRead={onMarkRead}
                onDelete={() => setDeleteProject(project)}
              />
            ))}
            <button
              onClick={() => setShowNew(true)}
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 h-48 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Nieuw project</span>
            </button>
          </div>
        )}
      </main>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={onCreated} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(editProject.id)}
        />
      )}
      {deleteProject && (
        <DeleteProjectModal
          project={deleteProject}
          onClose={() => setDeleteProject(null)}
          onDeleted={() => { onDeleted(deleteProject.id); setDeleteProject(null) }}
        />
      )}
    </div>
  )
}

const PREVIEW_INNER_WIDTH = 1280
const PREVIEW_HEIGHT = 180

function CardPreview({ projectId }: { projectId: string }) {
  const [components, setComponents] = useState<PageComponent[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.27)

  useEffect(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / PREVIEW_INNER_WIDTH)
    }
  }, [])

  useEffect(() => {
    fetch(`/api/projects/${projectId}/pages`)
      .then((r) => r.json())
      .then((pages) => {
        if (!Array.isArray(pages) || pages.length === 0) { setComponents([]); return }
        const firstPage = pages.sort((a: { order: number }, b: { order: number }) => a.order - b.order)[0]
        return fetch(`/api/pages/${firstPage.id}/components`).then((r) => r.json())
      })
      .then((comps) => {
        if (!comps) return
        const sorted = Array.isArray(comps) ? comps.sort((a: PageComponent, b: PageComponent) => a.order - b.order) : []
        setComponents(sorted.slice(0, 5))
      })
      .catch(() => setComponents([]))
  }, [projectId])

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

function DashboardStatusBadge({ status, clientAccess }: { status: ProjectStatus; clientAccess?: boolean }) {
  if (clientAccess === false) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
        <Lock size={9} />
        In ontwikkeling
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
        <Lock size={9} />
        In ontwikkeling
      </span>
    )
  }
  if (status === 'pending_review') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
        <MessageCircle size={9} />
        Wachten op feedback
      </span>
    )
  }
  if (status === 'feedback') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
        <MessageCircle size={9} />
        Feedback verwerken
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
      <CheckCircle2 size={9} />
      Goedgekeurd
    </span>
  )
}

function ProjectCard({ project, onEdit, onMarkRead, onDelete }: { project: Project; onEdit: () => void; onMarkRead: (id: string) => void; onDelete: () => void }) {
  const unread = project.unread_comments ?? 0
  const [copied, setCopied] = useState(false)

  async function handleMarkRead(e: React.MouseEvent) {
    e.preventDefault()
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    })
    onMarkRead(project.id)
  }

  function handleCopyLink(e: React.MouseEvent) {
    e.preventDefault()
    navigator.clipboard.writeText(`${window.location.origin}/preview/${project.preview_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group overflow-hidden">
      {/* Unread badge */}
      {unread > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={handleMarkRead}
            title="Markeer als gelezen"
            className="flex items-center justify-center w-5 h-5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-full shadow-md transition-colors"
          >
            {unread > 9 ? '9+' : unread}
          </button>
        </div>
      )}

      {/* Action icons — float over preview */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/preview/${project.preview_token}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-blue-500 shadow-sm transition-colors"
          title="Preview openen"
        >
          <Eye size={13} />
        </Link>
        <div className="relative">
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-colors"
            title="Link kopiëren"
          >
            <Link2 size={13} className={copied ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'} />
          </button>
          {copied && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap pointer-events-none">
              Link gekopieerd!
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onEdit() }}
          className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-gray-700 shadow-sm transition-colors"
          title="Bewerken"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete() }}
          className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-red-500 shadow-sm transition-colors"
          title="Verwijderen"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Preview thumbnail */}
      <Link href={`/projects/${project.id}`} className="block">
        <div className="border-b border-gray-100">
          <CardPreview projectId={project.id} />
        </div>

        {/* Card info */}
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
              {project.logo_url ? (
                <Image
                  src={project.logo_url}
                  alt={project.client_name}
                  width={28}
                  height={28}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <span className="text-gray-400 font-bold text-sm group-hover:text-blue-600 transition-colors">
                  {project.client_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{project.name}</h3>
              <p className="text-xs text-gray-400 truncate">{project.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <DashboardStatusBadge status={project.status ?? 'in_progress'} clientAccess={(project as Project & { client_access?: boolean }).client_access} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDate(project.updated_at)}
            </span>
            {unread > 0 && (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <MessageSquare size={11} />
                {unread} nieuwe {unread === 1 ? 'reactie' : 'reacties'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

function DeleteProjectModal({ project, onClose, onDeleted }: { project: Project; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    if (!res.ok) { setDeleting(false); return }
    onDeleted()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 text-sm">Project verwijderen?</p>
            <p className="text-red-600 text-sm mt-1">
              Dit verwijdert <strong>{project.name}</strong> inclusief alle pagina&apos;s en componenten. Dit kan niet ongedaan worden gemaakt.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Verwijderen...' : 'Ja, verwijderen'}
          </button>
        </div>
      </div>
    </div>
  )
}
