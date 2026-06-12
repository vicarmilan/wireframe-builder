'use client'

import { useState, useEffect, use } from 'react'
import {
  ArrowLeft, Plus, FileText, ExternalLink, Copy, Check, Code2,
  GripVertical, Pencil, Trash2, X, AlertTriangle, ChevronRight, ChevronDown,
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

// Build a tree from a flat list
function buildTree(pages: Page[]): Page[] {
  const map: Record<string, Page> = {}
  const roots: Page[] = []
  for (const p of pages) map[p.id] = { ...p, children: [] }
  for (const p of pages) {
    if (p.parent_id && map[p.parent_id]) {
      map[p.parent_id].children!.push(map[p.id])
    } else {
      roots.push(map[p.id])
    }
  }
  return roots
}

// Flatten tree to ordered list (for sibling reordering)
function flattenSiblings(pages: Page[]): Page[] {
  const result: Page[] = []
  for (const p of pages) {
    result.push(p)
    if (p.children?.length) result.push(...flattenSiblings(p.children))
  }
  return result
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPage, setShowNewPage] = useState(false)
  const [newPageParent, setNewPageParent] = useState<{ id: string; name: string } | null>(null)
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
    setNewPageParent(null)
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

  async function handleDragEnd(event: DragEndEvent, siblings: Page[], parentId: string | null) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = siblings.findIndex((p) => p.id === active.id)
    const newIndex = siblings.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(siblings, oldIndex, newIndex)
    // Update local state: replace only the affected siblings in the flat list
    setPages((prev) => {
      const updated = prev.map((p) => {
        const idx = reordered.findIndex((r) => r.id === p.id)
        if (idx !== -1) return { ...p, order: idx }
        return p
      })
      return updated
    })
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/projects/${id}/pages/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        })
      )
    )
    void parentId // suppress unused warning
  }

  async function handleDeletePage(page: Page) {
    await fetch(`/api/projects/${id}/pages/${page.id}`, { method: 'DELETE' })
    // Remove page and all its descendants
    const toRemove = new Set<string>()
    function collectIds(p: Page) {
      toRemove.add(p.id)
      pages.filter((c) => c.parent_id === p.id).forEach(collectIds)
    }
    collectIds(page)
    setPages((prev) => prev.filter((p) => !toRemove.has(p.id)))
    setDeletingPage(null)
  }

  async function handleUpdatePage(page: Page, name: string, slug: string) {
    const res = await fetch(`/api/projects/${id}/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    const updated = await res.json()
    setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, ...updated } : p))
    setEditingPage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    )
  }

  const tree = buildTree(pages.slice().sort((a, b) => a.order - b.order))

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
              onClick={() => { setNewPageParent(null); setShowNewPage(true) }}
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
                onClick={() => { setNewPageParent(null); setShowNewPage(true) }}
                className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Pagina toevoegen
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <PageTree
              pages={tree}
              allPages={pages}
              projectId={id}
              depth={0}
              sensors={sensors}
              onDragEnd={handleDragEnd}
              onEdit={(p) => setEditingPage(p)}
              onDelete={(p) => setDeletingPage(p)}
              onAddChild={(p) => { setNewPageParent({ id: p.id, name: p.name }); setShowNewPage(true) }}
            />
          </div>
        )}
      </main>

      {showNewPage && (
        <NewPageModal
          projectId={id}
          parentId={newPageParent?.id}
          parentName={newPageParent?.name}
          existingPages={pages}
          onClose={() => { setShowNewPage(false); setNewPageParent(null) }}
          onCreated={onPageCreated}
        />
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
          hasChildren={pages.some((p) => p.parent_id === deletingPage.id)}
          onClose={() => setDeletingPage(null)}
          onConfirm={() => handleDeletePage(deletingPage)}
        />
      )}
    </div>
  )
}

// Recursive tree renderer
function PageTree({
  pages,
  allPages,
  projectId,
  depth,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
  onAddChild,
}: {
  pages: Page[]
  allPages: Page[]
  projectId: string
  depth: number
  sensors: ReturnType<typeof useSensors>
  onDragEnd: (event: DragEndEvent, siblings: Page[], parentId: string | null) => void
  onEdit: (p: Page) => void
  onDelete: (p: Page) => void
  onAddChild: (p: Page) => void
}) {
  const parentId = pages[0]?.parent_id ?? null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => onDragEnd(e, pages, parentId)}
    >
      <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {pages.map((page) => (
          <PageRow
            key={page.id}
            page={page}
            allPages={allPages}
            projectId={projectId}
            depth={depth}
            sensors={sensors}
            onDragEnd={onDragEnd}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

function PageRow({
  page,
  allPages,
  projectId,
  depth,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
  onAddChild,
}: {
  page: Page
  allPages: Page[]
  projectId: string
  depth: number
  sensors: ReturnType<typeof useSensors>
  onDragEnd: (event: DragEndEvent, siblings: Page[], parentId: string | null) => void
  onEdit: (p: Page) => void
  onDelete: (p: Page) => void
  onAddChild: (p: Page) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const [expanded, setExpanded] = useState(true)
  const children = page.children ?? []
  const hasChildren = children.length > 0

  const indentWidth = depth * 24

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center group border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors ${depth > 0 ? 'border-l-2 border-l-blue-100' : ''}`}
        style={{ paddingLeft: indentWidth }}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="px-3 py-3.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors flex-shrink-0"
        >
          <GripVertical size={14} />
        </div>

        {/* Expand/collapse toggle */}
        <div className="w-5 flex-shrink-0">
          {hasChildren && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>

        {/* Page link */}
        <Link
          href={`/projects/${projectId}/${page.id}`}
          className="flex-1 flex items-center gap-3 py-3.5 pr-2 min-w-0"
        >
          <FileText size={14} className={`flex-shrink-0 transition-colors ${depth > 0 ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`} />
          <div className="min-w-0">
            <span className="font-medium text-sm text-gray-900 block truncate">{page.name}</span>
            <span className="text-xs text-gray-400">/{page.slug}</span>
          </div>
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {children.length}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto flex-shrink-0 pr-2">{formatDate(page.updated_at)}</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-0.5 pr-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); onAddChild(page) }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Subpagina toevoegen"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onEdit(page) }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Naam aanpassen"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(page) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Verwijderen"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <PageTree
          pages={children}
          allPages={allPages}
          projectId={projectId}
          depth={depth + 1}
          sensors={sensors}
          onDragEnd={onDragEnd}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      )}
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

function DeletePageModal({ page, hasChildren, onClose, onConfirm }: {
  page: Page
  hasChildren: boolean
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
              {hasChildren && ' Alle subpagina\'s worden ook verwijderd.'}
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
