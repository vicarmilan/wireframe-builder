'use client'

import { useState, useRef, useCallback } from 'react'
import { Search, X, ChevronLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import { COMPONENT_CATEGORIES, getComponentsByType } from '@/lib/components-registry'
import { ComponentType, ComponentDefinition } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

interface Props {
  onAdd: (def: ComponentDefinition) => void
}

const PREVIEW_WIDTH = 1024
const PREVIEW_SCALE = 0.28

export default function ComponentSidebar({ onAdd }: Props) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<ComponentType | null>(null)
  const [preview, setPreview] = useState<{ def: ComponentDefinition; y: number } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showPreview = useCallback((def: ComponentDefinition, y: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setPreview({ def, y })
  }, [])

  const hidePreview = useCallback(() => {
    hideTimer.current = setTimeout(() => setPreview(null), 120)
  }, [])

  const searchResults = search.trim()
    ? COMPONENT_CATEGORIES.flatMap((cat) =>
        getComponentsByType(cat.type).filter(
          (c) =>
            c.label.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
        )
      )
    : activeType
    ? getComponentsByType(activeType)
    : []

  function handleDragStart(e: React.DragEvent, def: ComponentDefinition) {
    e.dataTransfer.setData('application/vicar-component', JSON.stringify(def))
    e.dataTransfer.effectAllowed = 'copy'
    setPreview(null)
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value) setActiveType(null) }}
              placeholder="Zoek component..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Category list view */}
          {!search && !activeType && (
            <div className="p-3 space-y-0.5">
              {COMPONENT_CATEGORIES.map((cat) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const IconComp = (Icons as unknown as Record<string, React.ElementType>)[cat.icon]
                return (
                  <button
                    key={cat.type}
                    onClick={() => setActiveType(cat.type)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {IconComp && <IconComp size={15} />}
                    {cat.label}
                    <span className="ml-auto text-xs text-gray-400">
                      {getComponentsByType(cat.type).length}
                    </span>
                    <Icons.ChevronRight size={13} className="text-gray-300 -ml-1" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Component list view (submenu) */}
          {(search || activeType) && (
            <div>
              {/* Back button / category header */}
              {!search && activeType && (
                <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-gray-50 sticky top-0 bg-white z-10">
                  <button
                    onClick={() => { setActiveType(null); setPreview(null) }}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm transition-colors"
                  >
                    <ChevronLeft size={15} />
                    Terug
                  </button>
                  <span className="mx-2 text-gray-200">|</span>
                  <span className="text-sm font-medium text-gray-800">
                    {COMPONENT_CATEGORIES.find((c) => c.type === activeType)?.label}
                  </span>
                </div>
              )}

              <div className="p-3 space-y-1.5">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Geen resultaten</p>
                ) : (
                  searchResults.map((def) => (
                    <div
                      key={`${def.type}-${def.variant}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, def)}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        showPreview(def, rect.top)
                      }}
                      onMouseLeave={hidePreview}
                      onClick={() => onAdd(def)}
                      className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Icons.GripVertical size={12} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm text-gray-800 group-hover:text-blue-700">{def.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5 leading-snug">{def.description}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!search && !activeType && (
            <div className="px-4 py-6 text-center border-t border-gray-50 mt-1">
              <p className="text-xs text-gray-400">Klik een categorie om te bladeren,<br />of sleep een component naar het canvas</p>
            </div>
          )}
        </div>
      </aside>

      {/* Hover preview portal */}
      {preview && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: 264 + 12,
            top: Math.max(8, Math.min(preview.y - 20, window.innerHeight - PREVIEW_WIDTH * PREVIEW_SCALE - 16)),
          }}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current) }}
          onMouseLeave={hidePreview}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ width: PREVIEW_WIDTH * PREVIEW_SCALE, pointerEvents: 'none' }}>
            {/* Label */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">{preview.def.label}</span>
              <span className="text-[10px] text-gray-400">{preview.def.variant}</span>
            </div>
            {/* Scaled wireframe */}
            <div
              style={{
                width: PREVIEW_WIDTH,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                height: 'auto',
                pointerEvents: 'none',
              }}
            >
              <WireframeComponent
                component={{
                  id: 'preview',
                  page_id: 'preview',
                  component_type: preview.def.type,
                  component_variant: preview.def.variant,
                  order: 0,
                  props: {},
                  created_at: '',
                  updated_at: '',
                }}
                editing={false}
                onPropChange={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
