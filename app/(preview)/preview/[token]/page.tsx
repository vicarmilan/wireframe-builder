'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { MessageSquare, X, Send, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { Project, Page, PageComponent, Comment } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

interface FullProject extends Project {
  pages: (Page & { page_components: PageComponent[] })[]
}

export default function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { isSignedIn } = useAuth()
  const [project, setProject] = useState<FullProject | null>(null)
  const [activePage, setActivePage] = useState<string | null>(null)
  const [commenting, setCommenting] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/preview/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setProject(data)
        setActivePage(data.pages?.[0]?.id || null)
        setLoading(false)
      })
  }, [token])

  const currentPage = project?.pages.find((p) => p.id === activePage)

  async function submitComment(componentId: string) {
    if (!commentText.trim() || !authorName.trim() || !authorEmail.trim()) return

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_component_id: componentId,
        author_name: authorName,
        author_email: authorEmail,
        content: commentText,
      }),
    })
    const comment = await res.json()
    setComments((prev) => ({ ...prev, [componentId]: [...(prev[componentId] || []), comment] }))
    setCommentText('')
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setCommenting(null) }, 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-gray-400">
      Laden...
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview niet gevonden</h1>
        <p className="text-gray-500">Deze link is niet meer geldig.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Preview header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors mr-1"
              title="Terug naar dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900">{project?.name}</span>
            <span className="text-gray-400 text-xs ml-2">— {project?.client_name}</span>
          </div>
        </div>

        {/* Page tabs */}
        {project && project.pages.length > 1 && (
          <div className="flex gap-1">
            {project.pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activePage === page.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page.name}
              </button>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 flex items-center gap-1">
          <MessageSquare size={12} />
          Klik op een sectie om feedback te geven
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-2">
        {currentPage?.page_components.map((component) => (
          <div key={component.id} className="relative group">
            <div className="rounded-xl overflow-hidden">
              <WireframeComponent component={component} />
            </div>

            {/* Comment button */}
            <button
              onClick={() => setCommenting(commenting === component.id ? null : component.id)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 shadow-sm rounded-lg px-2.5 py-1.5 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            >
              <MessageSquare size={12} />
              {comments[component.id]?.length || 0} reacties
            </button>

            {/* Comment panel */}
            {commenting === component.id && (
              <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-900">Feedback geven</h4>
                  <button onClick={() => setCommenting(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>

                {/* Existing comments */}
                {comments[component.id]?.length > 0 && (
                  <div className="space-y-2">
                    {comments[component.id].map((c) => (
                      <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                            {c.author_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{c.author_name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {submitted ? (
                  <div className="text-center py-3 text-green-600 flex items-center justify-center gap-2 text-sm">
                    <Check size={16} />
                    Feedback verzonden!
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Jouw naam"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Jouw feedback op deze sectie..."
                        rows={2}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button
                        onClick={() => submitComment(component.id)}
                        disabled={!commentText.trim() || !authorName.trim() || !authorEmail.trim()}
                        className="self-end bg-[#2563EB] text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {currentPage?.page_components.length === 0 && (
          <div className="text-center py-24 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            Deze pagina heeft nog geen inhoud.
          </div>
        )}
      </div>
    </div>
  )
}
