'use client'

import { useState } from 'react'
import { X, Code2, AlertCircle, FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import { Page } from '@/types'

interface ImportComponent {
  type: string
  variant: string
  props?: Record<string, string>
}

interface ImportPage {
  name: string
  slug?: string
  parent?: string // slug of parent page
  components: ImportComponent[]
}

interface Props {
  projectId: string
  onClose: () => void
  onImported: (pages: Page[]) => void
}

export default function ImportPagesModal({ projectId, onClose, onImported }: Props) {
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ImportPage[] | null>(null)

  function parseJson(): ImportPage[] | null {
    try {
      const parsed = JSON.parse(json)
      const pages: ImportPage[] = parsed.pages ?? (Array.isArray(parsed) ? parsed : null)
      if (!pages) throw new Error('JSON moet een object zijn met een "pages" array')
      if (!Array.isArray(pages) || pages.length === 0) throw new Error('"pages" moet een niet-lege array zijn')
      const slugs = new Set<string>()
      for (const page of pages) {
        if (!page.name) throw new Error('Elke pagina heeft een "name" nodig')
        if (!Array.isArray(page.components)) throw new Error(`Pagina "${page.name}" heeft een "components" array nodig`)
        for (const c of page.components) {
          if (!c.type || !c.variant) throw new Error(`Component in "${page.name}" heeft "type" en "variant" nodig`)
        }
        if (page.slug) slugs.add(page.slug)
        if (page.parent && !slugs.has(page.parent) && !pages.find(p => (p.slug ?? slugToKey(p.name)) === page.parent)) {
          throw new Error(`Pagina "${page.name}" verwijst naar onbekende parent "${page.parent}"`)
        }
      }
      return pages
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ongeldige JSON')
      return null
    }
  }

  function slugToKey(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handlePreview() {
    setError('')
    const pages = parseJson()
    if (pages) setPreview(pages)
  }

  async function handleImport() {
    const pages = preview ?? parseJson()
    if (!pages) return
    setLoading(true)
    setError('')

    const createdPages: Page[] = []
    // map from import slug -> created page id
    const slugToId: Record<string, string> = {}

    for (const importPage of pages) {
      const key = importPage.slug ?? slugToKey(importPage.name)
      const parentId = importPage.parent ? slugToId[importPage.parent] ?? null : null

      const pageRes = await fetch(`/api/projects/${projectId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: importPage.name,
          slug: importPage.slug,
          parent_id: parentId,
        }),
      })
      const page = await pageRes.json()
      if (!pageRes.ok) { setError(`Pagina "${importPage.name}" aanmaken mislukt`); setLoading(false); return }

      slugToId[key] = page.id
      createdPages.push(page)

      if (importPage.components.length > 0) {
        await Promise.all(
          importPage.components.map((c, i) =>
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
    }

    onImported(createdPages)
  }

  // Build tree preview for display
  function buildPreviewTree(pages: ImportPage[]) {
    const roots: ImportPage[] = []
    const children: Record<string, ImportPage[]> = {}
    for (const p of pages) {
      if (p.parent) {
        children[p.parent] = children[p.parent] ?? []
        children[p.parent].push(p)
      } else {
        roots.push(p)
      }
    }
    return { roots, children }
  }

  function PreviewTree({ pages, children, depth = 0 }: { pages: ImportPage[]; children: Record<string, ImportPage[]>; depth?: number }) {
    return (
      <>
        {pages.map((page, i) => {
          const key = page.slug ?? page.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          const kids = children[key] ?? []
          return (
            <div key={i}>
              <div
                className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-gray-50"
                style={{ marginLeft: depth * 20 }}
              >
                {depth > 0 && <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
                <FileText size={13} className="text-[#2563EB] flex-shrink-0" />
                <span className="font-medium text-sm text-gray-900 flex-1">{page.name}</span>
                <span className="text-xs text-gray-400">{page.components.length} componenten</span>
              </div>
              {kids.length > 0 && (
                <PreviewTree pages={kids} children={children} depth={depth + 1} />
              )}
            </div>
          )
        })}
      </>
    )
  }

  const tree = preview ? buildPreviewTree(preview) : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-[#2563EB]" />
            <h2 className="text-lg font-semibold text-gray-900">Pagina&apos;s importeren via JSON</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!preview ? (
            <>
              <p className="text-sm text-gray-500">
                Gebruik het <code className="bg-gray-100 px-1 rounded text-xs">parent</code> veld om hiërarchie aan te geven. De waarde is de <code className="bg-gray-100 px-1 rounded text-xs">slug</code> van de bovenliggende pagina.
              </p>
              <textarea
                value={json}
                onChange={(e) => { setJson(e.target.value); setError('') }}
                placeholder={`{
  "pages": [
    {
      "name": "Menu",
      "slug": "menu",
      "components": [
        { "type": "navigation", "variant": "mega", "props": { "logo": "Restaurant" } },
        { "type": "hero", "variant": "minimal", "props": { "title": "Onze menukaart" } },
        { "type": "footer", "variant": "simple", "props": { "logo": "Restaurant" } }
      ]
    },
    {
      "name": "Lunch",
      "slug": "menu-lunch",
      "parent": "menu",
      "components": [
        { "type": "navigation", "variant": "mega", "props": { "logo": "Restaurant" } },
        { "type": "hero", "variant": "minimal", "props": { "title": "Lunchmenu" } },
        { "type": "footer", "variant": "simple", "props": { "logo": "Restaurant" } }
      ]
    }
  ]
}`}
                rows={16}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3 text-sm">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                JSON geldig — {preview.length} pagina{preview.length !== 1 ? "'s" : ''} gevonden
              </div>
              <div className="border border-gray-100 rounded-xl p-2">
                {tree && <PreviewTree pages={tree.roots} children={tree.children} />}
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                JSON aanpassen
              </button>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          {!preview ? (
            <button
              onClick={handlePreview}
              disabled={!json.trim()}
              className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Controleren
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Importeren...' : `${preview.length} pagina${preview.length !== 1 ? "'s" : ''} importeren`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
