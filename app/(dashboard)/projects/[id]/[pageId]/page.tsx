'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { ArrowLeft, Eye, Layout, Copy, Check } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

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

  async function handleAddAt(def: ComponentDefinition, index: number) {
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
    // Insert at the right position
    const currentComponents = useEditorStore.getState().components
    const newComponents = [...currentComponents, comp]
    // Move the newly added component to the desired index
    const from = newComponents.length - 1
    const to = Math.min(index, newComponents.length - 1)
    if (from !== to) {
      const reordered = arrayMove(newComponents, from, to)
      reorderComponents(reordered)
      // Persist order
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

        <EditorCanvas
          components={components}
          selectedId={selectedId}
          onSelect={setSelected}
          onReorder={handleReorder}
          onPropChange={handlePropChange}
          onAddClick={() => setSidebarOpen(true)}
          onAddAt={handleAddAt}
        />

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
