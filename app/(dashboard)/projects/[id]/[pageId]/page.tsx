'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { ArrowLeft, Eye, Layout, Copy, Check } from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'
import Link from 'next/link'
import { arrayMove } from '@dnd-kit/sortable'
import { PageComponent, ComponentDefinition, Project, Page } from '@/types'
import { useEditorStore } from '@/store/editor'
import EditorCanvas from '@/components/editor/EditorCanvas'
import ComponentSidebar from '@/components/editor/ComponentSidebar'
import PropertiesPanel from '@/components/editor/PropertiesPanel'

export default function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>
}) {
  const { id, pageId } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null)

  const {
    components,
    selectedId,
    sidebarOpen,
    setComponents,
    addComponent,
    updateComponent,
    removeComponent,
    reorderComponents,
    setSelected,
    setSidebarOpen,
  } = useEditorStore()

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/pages/${pageId}`).then((r) => r.json()),
      fetch(`/api/pages/${pageId}/components`).then((r) => r.json()),
    ]).then(([proj, pg, comps]) => {
      setProject(proj)
      setPage(pg)
      setComponents(Array.isArray(comps) ? comps : [])
      setLoading(false)
    })
  }, [id, pageId, setComponents])

  async function handleAddComponent(def: ComponentDefinition) {
    const res = await fetch(`/api/pages/${pageId}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component_type: def.type,
        component_variant: def.variant,
        props: {},
      }),
    })
    const comp = await res.json()
    addComponent(comp)
    setSelected(comp.id)
  }

  async function handleAddAt(def: ComponentDefinition, index: number): Promise<string | undefined> {
    const res = await fetch(`/api/pages/${pageId}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component_type: def.type,
        component_variant: def.variant,
        props: {},
      }),
    })
    const comp = await res.json()
    const currentComponents = useEditorStore.getState().components
    const newComponents = [...currentComponents, comp]
    const from = newComponents.length - 1
    const to = Math.min(index, newComponents.length - 1)
    if (from !== to) {
      const reordered = arrayMove(newComponents, from, to)
      reorderComponents(reordered)
      await fetch(`/api/pages/${pageId}/components`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: reordered.map((c, i) => ({ id: c.id, order: i })),
        }),
      })
    } else {
      addComponent(comp)
    }
    setSelected(comp.id)
    // Trigger drop animation
    setJustDroppedId(comp.id)
    setTimeout(() => setJustDroppedId(null), 400)
    return comp.id
  }

  const handlePropChange = useCallback(
    async (componentId: string, key: string, value: string) => {
      updateComponent(componentId, { [key]: value })
      // debounced save
      clearTimeout((window as unknown as Record<string, unknown>)[`save_${componentId}`] as ReturnType<typeof setTimeout>)
      ;(window as unknown as Record<string, unknown>)[`save_${componentId}`] = setTimeout(async () => {
        const comp = useEditorStore.getState().components.find((c) => c.id === componentId)
        if (!comp) return
        await fetch(`/api/pages/${pageId}/components`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: componentId, props: comp.props }),
        })
      }, 800)
    },
    [updateComponent, pageId]
  )

  async function handleReorder(newComponents: PageComponent[]) {
    reorderComponents(newComponents)
    await fetch(`/api/pages/${pageId}/components`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reorder: newComponents.map((c, i) => ({ id: c.id, order: i })),
      }),
    })
  }

  async function handleDelete(id: string) {
    removeComponent(id)
    await fetch(`/api/pages/${pageId}/components?id=${id}`, { method: 'DELETE' })
  }

  function copyPreviewLink() {
    if (!project) return
    navigator.clipboard.writeText(`${window.location.origin}/preview/${project.preview_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedComponent = selectedId ? components.find((c) => c.id === selectedId) : null

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="text-sm">
            <span className="text-gray-400">{project?.name}</span>
            <span className="text-gray-300 mx-2">/</span>
            <span className="font-medium text-gray-900">{page?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell apiUrl="/api/notifications" historyUrl="/dashboard/notifications" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sidebarOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layout size={14} />
            Componenten
          </button>
          <button
            onClick={copyPreviewLink}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Gekopieerd!' : 'Preview link'}
          </button>
          {project && (
            <Link
              href={`/preview/${project.preview_token}`}
              target="_blank"
              className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Eye size={14} />
              Preview
            </Link>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <ComponentSidebar onAdd={handleAddComponent} />}

        {loading ? (
          <EditorSkeleton />
        ) : (
          <EditorCanvas
            components={components}
            selectedId={selectedId}
            onSelect={setSelected}
            onReorder={handleReorder}
            onPropChange={handlePropChange}
            onAddClick={() => setSidebarOpen(true)}
            onAddAt={handleAddAt}
            justDroppedId={justDroppedId}
          />
        )}

        {selectedComponent && (
          <PropertiesPanel
            component={selectedComponent}
            onClose={() => setSelected(null)}
            onPropChange={(key, value) => handlePropChange(selectedComponent.id, key, value)}
            onDelete={() => handleDelete(selectedComponent.id)}
          />
        )}
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
      <div className="max-w-5xl mx-auto py-8 px-6 space-y-2">
        {/* Nav skeleton */}
        <div className="rounded-xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="skeleton h-5 w-24" />
            <div className="flex gap-6">
              {[80, 64, 72, 56, 68].map((w, i) => (
                <div key={i} className="skeleton h-3.5" style={{ width: w }} />
              ))}
            </div>
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="rounded-xl overflow-hidden bg-white">
          <div className="px-16 py-14 flex flex-col items-center gap-4">
            <div className="skeleton h-3 w-20 rounded-full" />
            <div className="skeleton h-8 w-96" />
            <div className="skeleton h-8 w-72" />
            <div className="skeleton h-4 w-80 mt-1" />
            <div className="skeleton h-4 w-64" />
            <div className="flex gap-3 mt-3">
              <div className="skeleton h-10 w-32 rounded-lg" />
              <div className="skeleton h-10 w-28 rounded-lg" />
            </div>
          </div>
          <div className="skeleton mx-8 mb-8 h-48 rounded-xl" />
        </div>

        {/* Features skeleton */}
        <div className="rounded-xl overflow-hidden bg-white">
          <div className="px-12 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-3.5 w-72" />
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-3 p-5 border border-gray-100 rounded-xl">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA skeleton */}
        <div className="rounded-xl overflow-hidden bg-white">
          <div className="px-16 py-12 flex flex-col items-center gap-4">
            <div className="skeleton h-6 w-64" />
            <div className="skeleton h-4 w-80" />
            <div className="skeleton h-10 w-36 rounded-lg mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
