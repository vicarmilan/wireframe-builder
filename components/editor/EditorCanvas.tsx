'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import { PageComponent, ComponentDefinition } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

const OVERLAY_SCALE = 0.5

interface Props {
  components: PageComponent[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (components: PageComponent[]) => void
  onPropChange: (id: string, key: string, value: string) => void
  onAddClick: () => void
  onAddAt: (def: ComponentDefinition, index: number) => Promise<string | undefined>
  justDroppedId?: string | null
}

export default function EditorCanvas({
  components,
  selectedId,
  onSelect,
  onReorder,
  onPropChange,
  onAddClick,
  onAddAt,
  justDroppedId,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [activeComponent, setActiveComponent] = useState<PageComponent | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  function handleDragStart(event: DragStartEvent) {
    const comp = components.find((c) => c.id === event.active.id)
    if (comp) setActiveComponent(comp)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveComponent(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = components.findIndex((c) => c.id === active.id)
    const newIndex = components.findIndex((c) => c.id === over.id)
    onReorder(arrayMove(components, oldIndex, newIndex))
  }

  // HTML5 drag handlers for sidebar drops
  function handleCanvasDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes('application/vicar-component')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
    const target = e.currentTarget as HTMLElement
    const items = target.querySelectorAll('[data-sortable-item]')
    let idx = components.length
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) { idx = i; break }
    }
    setDropIndex(idx)
  }

  function handleCanvasDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDropIndex(null)
    }
  }

  function handleCanvasDrop(e: React.DragEvent) {
    setIsDragOver(false)
    setDropIndex(null)
    const raw = e.dataTransfer.getData('application/vicar-component')
    if (!raw) return
    e.preventDefault()
    try {
      const def: ComponentDefinition = JSON.parse(raw)
      const target = e.currentTarget as HTMLElement
      const items = target.querySelectorAll('[data-sortable-item]')
      let idx = components.length
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        if (e.clientY < rect.top + rect.height / 2) { idx = i; break }
      }
      onAddAt(def, idx)
    } catch {}
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
      <div
        className="max-w-5xl mx-auto py-8 px-6"
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component, i) => (
              <div key={component.id}>
                {isDragOver && dropIndex === i && (
                  <div className="h-1 bg-blue-500 rounded-full mx-2 my-1" />
                )}
                <SortableItem
                  component={component}
                  selected={selectedId === component.id}
                  onSelect={() => onSelect(component.id)}
                  onPropChange={(key, value) => onPropChange(component.id, key, value)}
                  isNew={justDroppedId === component.id}
                  isDragging={activeComponent?.id === component.id}
                />
              </div>
            ))}
            {isDragOver && dropIndex === components.length && (
              <div className="h-1 bg-blue-500 rounded-full mx-2 my-1" />
            )}
          </SortableContext>

          {/* Scaled drag overlay for reorder */}
          <DragOverlay dropAnimation={null}>
            {activeComponent ? (
              <div
                style={{
                  zoom: OVERLAY_SCALE,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  background: 'white',
                  pointerEvents: 'none',
                }}
              >
                <WireframeComponent
                  component={activeComponent}
                  editing={false}
                  onPropChange={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {components.length === 0 && !isDragOver && (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-blue-500" />
            </div>
            <p className="text-gray-500 font-medium">Nog geen componenten</p>
            <p className="text-gray-400 text-sm mt-1">Voeg een component toe via de zijbalk</p>
            <button
              onClick={onAddClick}
              className="mt-5 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Component toevoegen
            </button>
          </div>
        )}

        {components.length === 0 && isDragOver && (
          <div className="text-center py-24 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-50/50">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-blue-500" />
            </div>
            <p className="text-blue-600 font-medium">Laat los om toe te voegen</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableItem({
  component,
  selected,
  onSelect,
  onPropChange,
  isNew,
  isDragging,
}: {
  component: PageComponent
  selected: boolean
  onSelect: () => void
  onPropChange: (key: string, value: string) => void
  isNew?: boolean
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: component.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    // Placeholder where the item was — subtle outline, no content shown
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, minHeight: 80 }}
        data-sortable-item
        className="mb-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-sortable-item
      className={`relative group mb-2 rounded-xl overflow-hidden border-2 transition-colors ${
        selected ? 'border-[#2563EB]' : 'border-transparent hover:border-gray-200'
      } ${isNew ? 'animate-drop-in' : ''}`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white shadow rounded-md p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>

      <WireframeComponent
        component={component}
        editing={selected}
        onPropChange={onPropChange}
      />
    </div>
  )
}
