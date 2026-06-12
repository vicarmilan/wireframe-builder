'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { MessageSquare, X, Send, Check, ArrowLeft, Lock, Pencil, Trash2 } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { Project, Page, PageComponent, Comment } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'
import OnboardingModal from '@/components/preview/OnboardingModal'

interface FullProject extends Project {
  pages: (Page & { page_components: PageComponent[] })[]
}

export default function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [project, setProject] = useState<FullProject | null>(null)
  const [activePage, setActivePage] = useState<string | null>(null)
  const [commenting, setCommenting] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const authorName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || '' : ''
  const authorEmail = user?.primaryEmailAddress?.emailAddress || ''

  useEffect(() => {
    fetch(`/api/preview/${token}`)
      .then((r) => {
        if (r.status === 403) { setForbidden(true); setLoading(false); return null }
        if (r.status === 401) { setForbidden(true); setLoading(false); return null }
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setProject(data)
        setActivePage(data.pages?.[0]?.id || null)
        setLoading(false)
        // Show onboarding once per browser
        const seen = localStorage.getItem('vicar_onboarding_seen')
        if (!seen) setShowOnboarding(true)
        // Load comments for all pages
        const allPageIds: string[] = data.pages?.map((p: { id: string }) => p.id) ?? []
        Promise.all(
          allPageIds.map((pageId) =>
            fetch(`/api/comments?page_id=${pageId}`).then((r) => r.ok ? r.json() : [])
          )
        ).then((results) => {
          const grouped: Record<string, Comment[]> = {}
          results.flat().forEach((c: Comment & { page_components?: { page_id: string } }) => {
            const cid = c.page_component_id
            grouped[cid] = [...(grouped[cid] || []), c]
          })
          setComments(grouped)
        })
      })
  }, [token])

  const currentPage = project?.pages.find((p) => p.id === activePage)

  async function submitComment(componentId: string) {
    if (!commentText.trim() || !authorName || !authorEmail) return

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
    const data = await res.json()
    if (!res.ok) {
      console.error('Comment opslaan mislukt:', data.error)
      alert(`Feedback kon niet worden opgeslagen: ${data.error ?? 'Onbekende fout'}`)
      return
    }
    setComments((prev) => ({ ...prev, [componentId]: [...(prev[componentId] || []), data] }))
    setCommentText('')
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setCommenting(null) }, 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-gray-400">
      Laden...
    </div>
  )

  if (forbidden) return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Lock size={20} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Geen toegang</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          {isSignedIn
            ? 'Je bent niet uitgenodigd voor dit project. Vraag de Vicar beheerder om toegang.'
            : 'Log in om deze preview te bekijken.'}
        </p>
        {!isSignedIn && (
          <Link href="/login" className="inline-block mt-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Inloggen
          </Link>
        )}
      </div>
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

  function handleOnboardingClose() {
    localStorage.setItem('vicar_onboarding_seen', '1')
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
      {/* Preview header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors mr-1" title="Terug naar dashboard">
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

        {/* Page tabs with dropdowns for children */}
        {project && project.pages.length > 1 && (
          <div className="flex gap-1 items-center">
            {project.pages
              .filter((p) => !p.parent_id)
              .map((page) => {
                const children = project.pages.filter((p) => p.parent_id === page.id)
                const isActive = activePage === page.id || children.some((c) => c.id === activePage)
                if (children.length === 0) {
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                        isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page.name}
                    </button>
                  )
                }
                return (
                  <div key={page.id} className="relative group">
                    <button
                      onClick={() => setActivePage(page.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                        isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page.name}
                      <svg width="10" height="6" viewBox="0 0 10 6" className="opacity-50 mt-px" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
                      <div className="bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px]">
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setActivePage(child.id)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              activePage === child.id ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-gray-400 hidden sm:block">{authorName}</span>
          )}
          <div className="text-xs text-gray-400 items-center gap-1 hidden md:flex">
            <MessageSquare size={12} />
            Klik op een sectie om feedback te geven
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-7 h-7 rounded-full border border-gray-200 text-gray-400 hover:text-[#2563EB] hover:border-blue-300 transition-colors text-xs font-bold flex items-center justify-center"
            title="Uitleg opnieuw bekijken"
          >
            ?
          </button>
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
              onClick={() => {
                const isOpening = commenting !== component.id
                setCommenting(isOpening ? component.id : null)
                if (isOpening) {
                  // Scroll to panel after state update + render
                  setTimeout(() => {
                    document.getElementById(`feedback-panel-${component.id}`)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                    })
                  }, 50)
                }
              }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 shadow-sm rounded-lg px-2.5 py-1.5 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            >
              <MessageSquare size={12} />
              {comments[component.id]?.length
                ? `${comments[component.id].length} reactie${comments[component.id].length !== 1 ? 's' : ''}`
                : 'Feedback geven'}
            </button>

            {/* Comment panel */}
            {commenting === component.id && (
              <div id={`feedback-panel-${component.id}`} className="mt-2 bg-white rounded-xl border border-gray-100 shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-gray-900">Feedback geven</h4>
                    {user && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{authorName}</span>
                    )}
                  </div>
                  <button onClick={() => setCommenting(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>

                {/* Existing comments */}
                {comments[component.id]?.length > 0 && (
                  <div className="space-y-2">
                    {comments[component.id].map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        currentEmail={authorEmail}
                        onDeleted={(id) => setComments((prev) => ({
                          ...prev,
                          [component.id]: prev[component.id].filter((x) => x.id !== id),
                        }))}
                        onEdited={(updated) => setComments((prev) => ({
                          ...prev,
                          [component.id]: prev[component.id].map((x) => x.id === updated.id ? updated : x),
                        }))}
                      />
                    ))}
                  </div>
                )}

                {submitted ? (
                  <div className="text-center py-3 text-green-600 flex items-center justify-center gap-2 text-sm">
                    <Check size={16} />
                    Feedback verzonden!
                  </div>
                ) : (
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
                      disabled={!commentText.trim()}
                      className="self-end bg-[#2563EB] text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </div>
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

function CommentItem({
  comment,
  currentEmail,
  onDeleted,
  onEdited,
}: {
  comment: Comment
  currentEmail: string
  onDeleted: (id: string) => void
  onEdited: (updated: Comment) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const isOwn = currentEmail && comment.author_email === currentEmail

  async function handleEdit() {
    if (!editText.trim() || editText === comment.content) { setEditing(false); return }
    setSaving(true)
    const res = await fetch('/api/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, content: editText, author_email: currentEmail }),
    })
    if (res.ok) {
      const updated = await res.json()
      onEdited(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Feedback verwijderen?')) return
    const res = await fetch(`/api/comments?id=${comment.id}&author_email=${encodeURIComponent(currentEmail)}`, {
      method: 'DELETE',
    })
    if (res.ok) onDeleted(comment.id)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 group/comment">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
            {comment.author_name.charAt(0)}
          </div>
          <span className="text-xs font-medium text-gray-700">{comment.author_name}</span>
          {comment.edited_at && (
            <span className="text-xs text-gray-400 italic">bewerkt</span>
          )}
        </div>
        {isOwn && !editing && (
          <div className="flex gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
            <button
              onClick={() => { setEditText(comment.content); setEditing(true) }}
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Bewerken"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Verwijderen"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-1.5 space-y-1.5">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            autoFocus
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleEdit}
              disabled={saving || !editText.trim()}
              className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-600">{comment.content}</p>
      )}
    </div>
  )
}
