'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { COMPONENT_CATEGORIES, getComponentsByType } from '@/lib/components-registry'
import { ComponentType, ComponentDefinition } from '@/types'

interface Props {
  onAdd: (def: ComponentDefinition) => void
}

export default function ComponentSidebar({ onAdd }: Props) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<ComponentType | null>(null)

  const filtered = search.trim()
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

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        {!search && (
          <div className="p-3 space-y-0.5">
            {COMPONENT_CATEGORIES.map((cat) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const IconComp = (Icons as unknown as Record<string, React.ElementType>)[cat.icon]
              return (
                <button
                  key={cat.type}
                  onClick={() => setActiveType(activeType === cat.type ? null : cat.type)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeType === cat.type
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {IconComp && <IconComp size={15} />}
                  {cat.label}
                  <span className="ml-auto text-xs text-gray-400">
                    {getComponentsByType(cat.type).length}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {(search || activeType) && (
          <div className="p-3 space-y-2">
            {!search && activeType && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
                {COMPONENT_CATEGORIES.find((c) => c.type === activeType)?.label}
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Geen resultaten</p>
            ) : (
              filtered.map((def) => (
                <button
                  key={`${def.type}-${def.variant}`}
                  onClick={() => onAdd(def)}
                  className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="font-medium text-sm text-gray-800 group-hover:text-blue-700">{def.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">{def.description}</div>
                </button>
              ))
            )}
          </div>
        )}

        {!search && !activeType && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">Kies een categorie of zoek een component</p>
          </div>
        )}
      </div>
    </aside>
  )
}
