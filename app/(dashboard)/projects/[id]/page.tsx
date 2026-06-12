'use client'

import { useState, useEffect, use } from 'react'
import {
  ArrowLeft, Plus, FileText, ExternalLink, Copy, Check, Code2,
  GripVertical, Pencil, Trash2, X, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { Project, Page } from '@/types'
import { formatDate } from '@/lib/utils'
import NewPageModal from '@/components/editor/NewPageModal'
import ImportPagesModal from '@/components/editor/ImportPagesModal'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPage, setShowNewPage] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [deletingPage, setDeletingPage] = useState<Page | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/pages`).then((r) => r.json()),
    ]).then(([proj, pgs]) => {
      setProject(proj)
      setPages(Array.isArray(pgs) ? pgs : [])
      setLoading(false)
    })
  }, [id])

  function onPageCreated(page: Page) {
    setPages((prev) => [...prev, page])
    setShowNewPage(false)
  }

  function onImported(newPages: Page[]) {
    setPages((prev) => [...prev, ...newPages])
    setShowImport(false)
  }

  function copyPreviewLink() {
    if (!project) return
    navigator.clipboard.writeText(`${window.location.origin}/preview/${project.preview_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = pages.findIndex((p) => p.id === active.id)
    const newIndex = pages.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(pages, oldIndex, newIndex)
    setPages(reordered)
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/projects/${id}/pages/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        })
      )
    )
  }

  async function handleDeletePage(page: Page) {
    await fetch(`/api/projects/${id}/pages/${page.id}`, { method: 'DELETE' })
    setPages((prev) => prev.filter((p) => p.id !== page.id))
    setDeletingPage(null)
  }

  async function handleUpdatePage(page: Page, name: string, slug: string) {
    const res = await fetch(`/api/projects/${id}/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    const updated = await res.json()
    setPages((prev) => prev.map((p) => p.id === page.id ? updated : p))
    setEditingPage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{project?.name}</h1>
            <p className="text-sm text-gray-500">{project?.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyPreviewLink}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Gekopieerd!' : 'Preview link'}
          </button>
          {project && (
            <Link
              href={`/preview/${project.preview_token}`}
              target="_blank"
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} />
              Preview
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Pagina&apos;s</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Code2 size={15} />
              JSON importeren
            </button>
            <button
              onClick={() => setShowNewPage(true)}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Pagina toevoegen
            </button>
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <FileText size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Nog geen pagina&apos;s</p>
            <p className="text-gray-400 text-sm mt-1">Voeg een pagina toe of importeer via JSON</p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setShowImport(true)}
                className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Code2 size={14} />
                JSON importeren
              </button>
              <button
                onClick={() => setShowNewPage(true)}
                className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Pagina toevoegen
              </button>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {pages.map((page) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    projectId={id}
                    onEdit={() => setEditingPage(page)}
                    onDelete={() => setDeletingPage(page)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {showNewPage && (
        <NewPageModal projectId={id} onClose={() => setShowNewPage(false)} onCreated={onPageCreated} />
      )}
      {showImport && (
        <ImportPagesModal projectId={id} onClose={() => setShowImport(false)} onImported={onImported} />
      )}
      {editingPage && (
        <EditPageModal
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={(name, slug) => handleUpdatePage(editingPage, name, slug)}
        />
      )}
      {deletingPage && (
        <DeletePageModal
          page={deletingPage}
          onClose={() => setDeletingPage(null)}
          onConfirm={() => handleDeletePage(deletingPage)}
        />
      )}
    </div>
  )
}

function SortablePage({ page, projectId, onEdit, onDelete }: {
  page: Page
  projectId: string
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      <div
        {...attributes}
        {...listeners}
        className="px-3 py-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors"
      >
        <GripVertical size={16} />
      </div>

      <Link href={`/projects/${projectId}/${page.id}`} className="flex-1 flex items-center gap-3 py-4 pr-4 min-w-0">
        <FileText size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        <div className="min-w-0">
          <span className="font-medium text-gray-900 block truncate">{page.name}</span>
          <span className="text-xs text-gray-400">/{page.slug}</span>
        </div>
        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{formatDate(page.updated_at)}</span>
      </Link>

      <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); onEdit() }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Naam aanpassen"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete() }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Verwijderen"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function EditPageModal({ page, onClose, onSave }: {
  page: Page
  onClose: () => void
  onSave: (name: string, slug: string) => void
}) {
  const [name, setName] = useState(page.name)
  const [slug, setSlug] = useState(page.slug)
  const [saving, setSaving] = useState(false)

  function autoSlug(n: string) {
    return n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    setSaving(true)
    await onSave(name.trim(), slug.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pagina bewerken</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naam</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSlug(autoSlug(e.target.value)) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
              Annuleren
            </button>
            <button type="submit" disabled={saving || !name.trim() || !slug.trim()} className="flex-1 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeletePageModal({ page, onClose, onConfirm }: {
  page: Page
  onClose: () => void
  onConfirm: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 text-sm">Pagina verwijderen?</p>
            <p className="text-red-600 text-sm mt-1">
              <strong>{page.name}</strong> en alle componenten worden permanent verwijderd.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuleren
          </button>
          <button
            onClick={async () => { setDeleting(true); await onConfirm() }}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? 'Verwijderen...' : 'Verwijderen'}
          </button>
        </div>
      </div>
    </div>
  )
}
