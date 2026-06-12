'use client'

import { useState } from 'react'
import { X, FileText, Code2, AlertCircle } from 'lucide-react'
import { Page } from '@/types'

interface ImportComponent {
  type: string
  variant: string
  props?: Record<string, string>
}

interface Props {
  projectId: string
  parentId?: string | null
  parentName?: string | null
  existingPages?: Page[]
  onClose: () => void
  onCreated: (page: Page, components?: ImportComponent[]) => void
}

export default function NewPageModal({ projectId, parentId, parentName, existingPages, onClose, onCreated }: Props) {
  const [tab, setTab] = useState<'blank' | 'import'>('blank')
  const [name, setName] = useState('')
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>(parentId ?? '')

  function validateJson(): ImportComponent[] | null {
    try {
      const parsed = JSON.parse(json)
      const components = parsed.components ?? parsed
      if (!Array.isArray(components)) throw new Error('JSON moet een array zijn of een object met een "components" array')
      for (const c of components) {
        if (!c.type || !c.variant) throw new Error(`Elk component heeft "type" en "variant" nodig`)
      }
      return components
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ongeldige JSON')
      return null
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    let components: ImportComponent[] | undefined

    if (tab === 'import') {
      const parsed = validateJson()
      if (!parsed) { setLoading(false); return }
      components = parsed
    }

    // Maak pagina aan
    const res = await fetch(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), parent_id: selectedParentId || null }),
    })
    const page = await res.json()
    if (!res.ok) { setError(page.error || 'Er ging iets mis'); setLoading(false); return }

    // Importeer componenten indien aanwezig
    if (components && components.length > 0) {
      await Promise.all(
        components.map((c, i) =>
          fetch(`/api/pages/${page.id}/components`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              component_type: c.type,
              component_variant: c.variant,
              props: c.props || {},
              order: i,
            }),
          })
        )
      )
    }

    onCreated(page, components)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nieuwe pagina</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('blank')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'blank' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={15} />
            Blanco pagina
          </button>
          <button
            onClick={() => setTab('import')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'import' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code2 size={15} />
            JSON importeren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Paginanaam</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. Homepage"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {existingPages && existingPages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bovenliggende pagina (optioneel)</label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Geen (topniveau)</option>
                {existingPages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {parentName && !selectedParentId && (
                <p className="text-xs text-gray-400 mt-1">Subpagina van: {parentName}</p>
              )}
            </div>
          )}

          {tab === 'import' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                JSON
              </label>
              <textarea
                value={json}
                onChange={(e) => { setJson(e.target.value); setError('') }}
                placeholder={`{\n  "components": [\n    { "type": "navigation", "variant": "simple", "props": { "logo": "Bedrijfsnaam" } },\n    { "type": "hero", "variant": "centered", "props": { "title": "Welkom" } }\n  ]\n}`}
                rows={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Vraag Claude om een JSON layout te genereren voor jouw klant.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || (tab === 'import' && !json.trim())}
              className="flex-1 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Aanmaken...' : tab === 'import' ? 'Importeren' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
