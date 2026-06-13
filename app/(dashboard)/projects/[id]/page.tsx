'use client'

import { useState, useEffect, use, useRef } from 'react'
import {
  ArrowLeft, Plus, FileText, ExternalLink, Copy, Check, Code2,
  GripVertical, Pencil, Trash2, X, AlertTriangle, Users, UserPlus, UserMinus,
  List, Network,
} from 'lucide-react'
import Link from 'next/link'
import { Project, Page } from '@/types'
import { formatDate } from '@/lib/utils'
import NewPageModal from '@/components/editor/NewPageModal'
import ImportPagesModal from '@/components/editor/ImportPagesModal'
import EditProjectModal from '@/components/editor/EditProjectModal'
import NotificationBell from '@/components/shared/NotificationBell'
import {
  DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const INDENT_WIDTH = 24

type FlatPage = Page & { depth: number }

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

function flattenTree(pages: Page[], depth = 0): FlatPage[] {
  return pages.flatMap((p) => [
    { ...p, depth },
    ...flattenTree(p.children ?? [], depth + 1),
  ])
}

function getProjection(
  items: FlatPage[],
  activeId: string,
  overId: string,
  dragOffsetLeft: number
): { depth: number; parentId: string | null } | null {
  const activeIndex = items.findIndex((i) => i.id === activeId)
  const overIndex = items.findIndex((i) => i.id === overId)
  if (activeIndex === -1 || overIndex === -1) return null

  const overItem = items[overIndex]

  // Special case: dragging an item UP onto the item directly above it while
  // pulling right. arrayMove would place the active item BEFORE the over item,
  // leaving no previous item and making nesting impossible. Detect this and
  // treat it as "drop as child of the over item" instead.
  if (activeIndex > overIndex && dragOffsetLeft > INDENT_WIDTH / 2) {
    return { depth: overItem.depth + 1, parentId: overItem.id }
  }

  const newItems = arrayMove(items, activeIndex, overIndex)
  const newIndex = newItems.findIndex((i) => i.id === activeId)
  const previousItem = newItems[newIndex - 1]
  const nextItem = newItems[newIndex + 1]

  const dragDepth = Math.round(dragOffsetLeft / INDENT_WIDTH)
  const rawDepth = (newItems[newIndex].depth ?? 0) + dragDepth

  const maxDepth = previousItem ? previousItem.depth + 1 : 0
  const minDepth = nextItem ? nextItem.depth : 0
  const depth = Math.max(minDepth, Math.min(rawDepth, maxDepth))

  let parentId: string | null = null
  if (depth > 0 && previousItem) {
    if (previousItem.depth === depth - 1) {
      parentId = previousItem.id
    } else if (previousItem.depth >= depth) {
      const ancestor = newItems
        .slice(0, newIndex)
        .reverse()
        .find((i) => i.depth === depth - 1)
      parentId = ancestor?.id ?? null
    }
  }

  return { depth, parentId }
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
  const [showMembers, setShowMembers] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'sitemap'>('list')

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const offsetLeftRef = useRef(0)

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

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
    setOverId(active.id as string)
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    offsetLeftRef.current = delta.x
    setOffsetLeft(delta.x)
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id as string ?? null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    const currentOffset = offsetLeftRef.current
    offsetLeftRef.current = 0
    setActiveId(null)
    setOverId(null)
    setOffsetLeft(0)

    if (!over) return

    const tree = buildTree(pages.slice().sort((a, b) => a.order - b.order))
    const flat = flattenTree(tree)
    const projection = getProjection(flat, active.id as string, over.id as string, currentOffset)
    if (!projection) return

    const activePage = pages.find((p) => p.id === active.id)
    if (!activePage) return

    // Skip if nothing changed
    const samePosition = active.id === over.id
    const sameParent = (activePage.parent_id ?? null) === (projection.parentId ?? null)
    const depthChange = projection.depth !== flat.find((p) => p.id === active.id)?.depth
    if (samePosition && sameParent && !depthChange) return

    const activeIndex = flat.findIndex((i) => i.id === active.id)
    const overIndex = flat.findIndex((i) => i.id === over.id)
    const newFlat = active.id === over.id
      ? flat // same row: order within parent doesn't change, only parent_id changes
      : arrayMove(flat, activeIndex, overIndex)

    const insertIndex = newFlat.findIndex((p) => p.id === active.id)
    const siblingsBeforeInsert = newFlat
      .slice(0, insertIndex)
      .filter((p) => p.id !== active.id && (p.parent_id ?? null) === (projection.parentId ?? null))
    const newOrder = siblingsBeforeInsert.length

    // Optimistic update
    setPages((prev) =>
      prev.map((p) =>
        p.id === active.id
          ? { ...p, parent_id: projection.parentId, order: newOrder }
          : p
      )
    )

    await fetch(`/api/projects/${id}/pages/${active.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: projection.parentId, order: newOrder }),
    })
  }

  async function handleDeletePage(page: Page) {
    await fetch(`/api/projects/${id}/pages/${page.id}`, { method: 'DELETE' })
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
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* Header skeleton */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="skeleton w-5 h-5" />
            <div>
              <div className="skeleton h-4 w-36 mb-1.5" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-24 rounded-lg" />
            <div className="skeleton h-9 w-28 rounded-lg" />
            <div className="skeleton h-9 w-20 rounded-lg" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="skeleton h-5 w-24" />
            <div className="flex gap-2">
              <div className="skeleton h-9 w-36 rounded-lg" />
              <div className="skeleton h-9 w-36 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {[160, 120, 180, 140].map((w, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="skeleton w-3.5 h-3.5 flex-shrink-0" />
                <div className="skeleton w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-3.5 mb-1.5" style={{ width: w }} />
                  <div className="skeleton h-2.5 w-20" />
                </div>
                <div className="skeleton h-2.5 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  const tree = buildTree(pages.slice().sort((a, b) => a.order - b.order))
  const flatItems = flattenTree(tree)

  // Compute projected position during drag
  const projected =
    activeId && overId
      ? getProjection(flatItems, activeId, overId, offsetLeft)
      : null

  const activePage = pages.find((p) => p.id === activeId)

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
          <NotificationBell apiUrl="/api/notifications" />
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} />
            Bewerken
          </button>
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Users size={14} />
            Toegang
          </button>
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Pagina&apos;s</h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={13} />
                Lijst
              </button>
              <button
                onClick={() => setViewMode('sitemap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'sitemap' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Network size={13} />
                Sitemap
              </button>
            </div>
          </div>
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

        {flatItems.length === 0 ? (
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
        ) : viewMode === 'sitemap' ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto p-8">
            <SitemapView
              tree={tree}
              projectId={id}
              onEdit={(page) => setEditingPage(page)}
              onDelete={(page) => setDeletingPage(page)}
              onAddChild={(page) => { setNewPageParent({ id: page.id, name: page.name }); setShowNewPage(true) }}
            />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={flatItems.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {flatItems.map((page) => {
                  const isActive = page.id === activeId
                  const depth = (isActive && projected) ? projected.depth : page.depth
                  return (
                    <SortablePageRow
                      key={page.id}
                      page={page}
                      projectId={id}
                      depth={depth}
                      isActive={isActive}
                      onEdit={() => setEditingPage(page)}
                      onDelete={() => setDeletingPage(page)}
                      onAddChild={() => { setNewPageParent({ id: page.id, name: page.name }); setShowNewPage(true) }}
                    />
                  )
                })}
              </div>
            </SortableContext>

            <DragOverlay>
              {activePage && (
                <div className="bg-white border border-blue-300 shadow-lg rounded-xl flex items-center gap-3 px-4 py-3.5 opacity-95">
                  <GripVertical size={14} className="text-gray-400" />
                  <FileText size={14} className="text-blue-500" />
                  <span className="font-medium text-sm text-gray-900">{activePage.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
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
      {showMembers && (
        <MembersModal projectId={id} onClose={() => setShowMembers(false)} />
      )}
      {showEdit && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onUpdated={(updated) => { setProject(updated); setShowEdit(false) }}
          onDeleted={() => { window.location.href = '/dashboard' }}
        />
      )}
    </div>
  )
}

function SitemapNode({
  page,
  projectId,
  isRoot = false,
  onEdit,
  onDelete,
  onAddChild,
}: {
  page: Page
  projectId: string
  isRoot?: boolean
  onEdit: (p: Page) => void
  onDelete: (p: Page) => void
  onAddChild: (p: Page) => void
}) {
  const children = page.children ?? []
  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="group relative">
        <Link
          href={`/projects/${projectId}/${page.id}`}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-center w-36 transition-all hover:border-blue-300 hover:shadow-sm ${
            isRoot
              ? 'bg-[#2563EB] border-blue-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <FileText size={14} className={isRoot ? 'text-blue-200' : 'text-gray-400'} />
          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${isRoot ? 'text-white' : 'text-gray-800'}`}>
            {page.name}
          </span>
          <span className={`text-[10px] truncate max-w-full ${isRoot ? 'text-blue-200' : 'text-gray-400'}`}>
            /{page.slug}
          </span>
        </Link>
        {/* Hover actions */}
        <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-0.5 bg-white border border-gray-100 rounded-lg shadow-md p-0.5 z-10">
          <button
            onClick={() => onAddChild(page)}
            className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Subpagina toevoegen"
          >
            <Plus size={11} />
          </button>
          <button
            onClick={() => onEdit(page)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Bewerken"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onDelete(page)}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Verwijderen"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* Vertical line down from parent */}
          <div className="w-px h-8 bg-gray-200" />
          {/* Row of children */}
          <div className="relative flex items-start gap-6">
            {/* Horizontal connector spanning all children */}
            {children.length > 1 && (
              <div className="absolute top-0 left-[calc(50%_/_var(--n))] right-[calc(50%_/_var(--n))] h-px bg-gray-200"
                style={{ left: `calc(50% / ${children.length})`, right: `calc(50% / ${children.length})` }}
              />
            )}
            {children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-8 bg-gray-200" />
                <SitemapNode
                  page={child}
                  projectId={projectId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SitemapView({
  tree,
  projectId,
  onEdit,
  onDelete,
  onAddChild,
}: {
  tree: Page[]
  projectId: string
  onEdit: (p: Page) => void
  onDelete: (p: Page) => void
  onAddChild: (p: Page) => void
}) {
  return (
    <div className="flex gap-12 items-start justify-center flex-wrap min-w-max mx-auto">
      {tree.map((root) => (
        <SitemapNode
          key={root.id}
          page={root}
          projectId={projectId}
          isRoot
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  )
}

function SortablePageRow({
  page,
  projectId,
  depth,
  isActive,
  onEdit,
  onDelete,
  onAddChild,
}: {
  page: FlatPage
  projectId: string
  depth: number
  isActive: boolean
  onEdit: () => void
  onDelete: () => void
  onAddChild: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center border-b border-gray-50 last:border-b-0 group transition-colors ${
        isActive ? 'opacity-30' : 'hover:bg-gray-50'
      }`}
    >
      {/* Indent */}
      {depth > 0 && (
        <div
          className="flex-shrink-0 border-l-2 border-blue-100 self-stretch"
          style={{ marginLeft: depth * INDENT_WIDTH, width: 0 }}
        />
      )}
      <div style={{ paddingLeft: depth * INDENT_WIDTH }} className="flex items-center flex-1 min-w-0">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="px-3 py-3.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors flex-shrink-0"
        >
          <GripVertical size={14} />
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
          <span className="text-xs text-gray-400 ml-auto flex-shrink-0 pr-2">{formatDate(page.updated_at)}</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-0.5 pr-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); onAddChild() }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Subpagina toevoegen"
          >
            <Plus size={13} />
          </button>
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
              {hasChildren && " Alle subpagina's worden ook verwijderd."}
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

interface Member {
  id: string
  user_id: string
  email: string
  name: string | null
  imageUrl: string
  via?: 'direct' | 'client'
  clientName?: string
}

interface ClerkUser {
  id: string
  email: string
  name: string | null
  imageUrl: string
  role: string
}

function MembersModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [members, setMembers] = useState<Member[]>([])
  const [clientMembers, setClientMembers] = useState<Member[]>([])
  const [linkedClient, setLinkedClient] = useState<{ id: string; name: string } | null>(null)
  const [clientAccess, setClientAccess] = useState(true)
  const [togglingAccess, setTogglingAccess] = useState(false)
  const [allUsers, setAllUsers] = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}/members`).then((r) => r.ok ? r.json() : { members: [], clientMembers: [], client: null, clientAccess: true }),
      fetch('/api/admin/users').then((r) => r.ok ? r.json() : []),
    ]).then(([m, u]) => {
      setMembers(Array.isArray(m?.members) ? m.members : [])
      setClientMembers(Array.isArray(m?.clientMembers) ? m.clientMembers : [])
      setLinkedClient(m?.client ?? null)
      setClientAccess(m?.clientAccess ?? true)
      setAllUsers(Array.isArray(u) ? u.filter((user: ClerkUser) => user.role !== 'admin') : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [projectId])

  async function toggleClientAccess() {
    setTogglingAccess(true)
    const next = !clientAccess
    // Sync status: access off → in_progress, access on → pending_review
    const newStatus = next ? 'pending_review' : 'in_progress'
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_access: next, status: newStatus }),
    })
    setClientAccess(next)
    setTogglingAccess(false)
  }

  async function addMember(userId: string) {
    setAdding(true)
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    if (res.ok) {
      const user = allUsers.find((u) => u.id === userId)
      if (user) setMembers((prev) => [...prev, { id: Date.now().toString(), user_id: userId, email: user.email, name: user.name, imageUrl: user.imageUrl, via: 'direct' }])
    }
    setAdding(false)
    setSearch('')
  }

  async function removeMember(userId: string) {
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    setMembers((prev) => prev.filter((m) => m.user_id !== userId))
  }

  const allAccessIds = new Set([...members.map((m) => m.user_id), ...clientMembers.map((m) => m.user_id)])
  const suggestions = allUsers.filter(
    (u) => !allAccessIds.has(u.id) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#2563EB]" />
            <h2 className="font-semibold text-gray-900">Preview toegang</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gebruiker toevoegen</label>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoek op naam of e-mail..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => addMember(u.id)}
                      disabled={adding}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <UserPlus size={14} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{u.name || u.email}</div>
                        {u.name && <div className="text-xs text-gray-400 truncate">{u.email}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {search && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 px-3 py-3 text-sm text-gray-400">
                  Geen gebruikers gevonden
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <>
              {/* Company access toggle */}
              {linkedClient && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{linkedClient.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {clientAccess
                          ? `${clientMembers.length} gebruiker${clientMembers.length !== 1 ? 's' : ''} heeft automatisch toegang`
                          : 'Bedrijf heeft geen toegang tot deze preview'}
                      </p>
                    </div>
                    <button
                      onClick={toggleClientAccess}
                      disabled={togglingAccess}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none disabled:opacity-50 ${clientAccess ? 'bg-[#2563EB]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${clientAccess ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {clientAccess && clientMembers.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {clientMembers.map((m) => (
                        <div key={m.user_id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-50">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                            {(m.name || m.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">{m.name || m.email || 'Onbekende gebruiker'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Explicit members */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Individueel uitgenodigd <span className="text-gray-400 font-normal">({members.length})</span>
                </p>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Nog niemand individueel uitgenodigd.</p>
                ) : (
                  <div className="space-y-1">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {(m.name || m.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{m.name || m.email || 'Onbekende gebruiker'}</div>
                          {m.name && m.email && <div className="text-xs text-gray-400 truncate">{m.email}</div>}
                        </div>
                        <button
                          onClick={() => removeMember(m.user_id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                          title="Toegang verwijderen"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
