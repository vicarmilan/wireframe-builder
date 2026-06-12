'use client'

import { X, Trash2 } from 'lucide-react'
import { PageComponent } from '@/types'
import { getComponentDef } from '@/lib/components-registry'

interface Props {
  component: PageComponent
  onClose: () => void
  onPropChange: (key: string, value: string) => void
  onDelete: () => void
}

export default function PropertiesPanel({ component, onClose, onPropChange, onDelete }: Props) {
  const def = getComponentDef(component.component_type, component.component_variant)

  const groups = def?.fields.reduce(
    (acc, field) => {
      const group = field.group || '_'
      if (!acc[group]) acc[group] = []
      acc[group].push(field)
      return acc
    },
    {} as Record<string, typeof def.fields>
  ) || {}

  return (
    <aside className="w-72 bg-white border-l border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm text-gray-900">{def?.label || component.component_type}</div>
          <div className="text-xs text-gray-400">{def?.description}</div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {Object.entries(groups).map(([group, fields]) => (
          <div key={group}>
            {group !== '_' && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</div>
            )}
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={component.props[field.key] || ''}
                      onChange={(e) => onPropChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <input
                      type={field.type === 'url' ? 'url' : 'text'}
                      value={component.props[field.key] || ''}
                      onChange={(e) => onPropChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!def && (
          <p className="text-sm text-gray-400 text-center py-4">Geen velden beschikbaar</p>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm transition-colors"
        >
          <Trash2 size={14} />
          Verwijder component
        </button>
      </div>
    </aside>
  )
}
