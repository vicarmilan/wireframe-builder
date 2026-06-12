'use client'

import { useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
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
import { PageComponent } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

interface Props {
  components: PageComponent[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (components: PageComponent[]) => void
  onPropChange: (id: string, key: string, value: string) => void
  onAddClick: () => void
}

export default function EditorCanvas({
  components,
  selectedId,
  onSelect,
  onReorder,
  onPropChange,
  onAddClick,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = components.findIndex((c) => c.id === active.id)
    const newIndex = components.findIndex((c) => c.id === over.id)
    onReorder(arrayMove(components, oldIndex, newIndex))
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
      <div className="max-w-5xl mx-auto py-8 px-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component) => (
              <SortableItem
                key={component.id}
                component={component}
                selected={selectedId === component.id}
                onSelect={() => onSelect(component.id)}
                onPropChange={(key, value) => onPropChange(component.id, key, value)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {components.length === 0 && (
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
      </div>
    </div>
  )
}

function SortableItem({
  component,
  selected,
  onSelect,
  onPropChange,
}: {
  component: PageComponent
  selected: boolean
  onSelect: () => void
  onPropChange: (key: string, value: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group mb-2 rounded-xl overflow-hidden border-2 transition-colors ${
        selected ? 'border-[#2563EB]' : 'border-transparent hover:border-gray-200'
      }`}
      onClick={onSelect}
    >
      {/* Drag handle */}
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
