'use client'

import { useState, useEffect, use } from 'react'
import { ArrowLeft, Plus, FileText, ExternalLink, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Project, Page } from '@/types'
import { formatDate } from '@/lib/utils'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPage, setShowAddPage] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

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

  async function addPage(e: React.FormEvent) {
    e.preventDefault()
    if (!newPageName.trim()) return

    const res = await fetch(`/api/projects/${id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPageName.trim() }),
    })
    const page = await res.json()
    setPages((prev) => [...prev, page])
    setNewPageName('')
    setShowAddPage(false)
  }

  function copyPreviewLink() {
    if (!project) return
    navigator.clipboard.writeText(`${window.location.origin}/preview/${project.preview_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    )
  }

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
          <h2 className="text-lg font-semibold text-gray-900">Pagina&apos;s</h2>
          <button
            onClick={() => setShowAddPage(true)}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Pagina toevoegen
          </button>
        </div>

        <div className="space-y-3">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/projects/${id}/${page.id}`}
              className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div>
                  <span className="font-medium text-gray-900">{page.name}</span>
                  <span className="text-xs text-gray-400 ml-3">/{page.slug}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">{formatDate(page.updated_at)}</span>
            </Link>
          ))}

          {pages.length === 0 && !showAddPage && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Nog geen pagina&apos;s</p>
              <p className="text-gray-400 text-sm mt-1">Voeg je eerste pagina toe</p>
            </div>
          )}

          {showAddPage && (
            <form onSubmit={addPage} className="bg-white rounded-xl px-6 py-4 border-2 border-blue-200 flex items-center gap-3">
              <FileText size={18} className="text-gray-400 flex-shrink-0" />
              <input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Paginanaam, bijv. Homepage"
                className="flex-1 text-sm focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && setShowAddPage(false)}
              />
              <button type="submit" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Opslaan
              </button>
              <button type="button" onClick={() => setShowAddPage(false)} className="text-gray-400 text-sm hover:text-gray-600">
                Annuleren
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
