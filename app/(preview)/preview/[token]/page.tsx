'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { MessageSquare, X, Send, Check, ArrowLeft, Lock, Pencil, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'
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
  const [showApproval, setShowApproval] = useState(false)
  const [approved, setApproved] = useState(false)

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
        // Scroll to a specific component if hash is present
        const hash = window.location.hash
        if (hash.startsWith('#feedback-panel-')) {
          const componentId = hash.replace('#feedback-panel-', '')
          // Find which page this component belongs to
          const targetPage = data.pages?.find((p: { page_components: { id: string }[] }) =>
            p.page_components?.some((c: { id: string }) => c.id === componentId)
          )
          if (targetPage) {
            setActivePage(targetPage.id)
            setCommenting(componentId)
            setTimeout(() => {
              document.getElementById(`feedback-panel-${componentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 400)
          }
        }
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
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Header skeleton */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="flex gap-1">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-7 w-20 rounded-lg" />
          <div className="skeleton h-7 w-14 rounded-lg" />
        </div>
        <div className="skeleton h-4 w-40 hidden md:block" />
      </header>

      {/* Page blocks skeleton */}
      <div>
        {/* Nav block */}
        <div className="bg-white border-b border-gray-50">
          <div className="flex items-center justify-between px-10 py-4">
            <div className="skeleton h-5 w-28" />
            <div className="flex gap-6">
              {[72, 60, 80, 56, 68].map((w, i) => (
                <div key={i} className="skeleton h-3.5" style={{ width: w }} />
              ))}
            </div>
            <div className="skeleton h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Hero block */}
        <div className="bg-white py-20 flex flex-col items-center gap-5 px-8">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-9 w-[420px] max-w-full" />
          <div className="skeleton h-9 w-72 max-w-full" />
          <div className="skeleton h-4 w-80 max-w-full mt-1" />
          <div className="skeleton h-4 w-60 max-w-full" />
          <div className="flex gap-3 mt-4">
            <div className="skeleton h-11 w-32 rounded-lg" />
            <div className="skeleton h-11 w-28 rounded-lg" />
          </div>
          <div className="skeleton w-full max-w-2xl h-52 rounded-xl mt-4" />
        </div>

        {/* Features block */}
        <div className="bg-[#F8F9FA] py-16 px-10">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="skeleton h-6 w-52" />
            <div className="skeleton h-4 w-80" />
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 space-y-3">
                <div className="skeleton h-9 w-9 rounded-lg" />
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA block */}
        <div className="bg-white py-16 flex flex-col items-center gap-4 px-8">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-80" />
          <div className="skeleton h-11 w-36 rounded-lg mt-2" />
        </div>

        {/* Footer block */}
        <div className="bg-gray-900 py-12 px-10">
          <div className="flex justify-between max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="skeleton h-5 w-28" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="skeleton h-3 w-48" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="skeleton h-3 w-40" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-3.5 w-20" style={{ background: 'rgba(255,255,255,0.1)' }} />
                {[48, 56, 44, 52].map((w, j) => (
                  <div key={j} className="skeleton h-3" style={{ width: w, background: 'rgba(255,255,255,0.07)' }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
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
      {showApproval && (
        <ApprovalModal
          onClose={() => setShowApproval(false)}
          onConfirm={() => { setApproved(true); setShowApproval(false) }}
        />
      )}
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

        <div className="flex items-center gap-2">
          {approved ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={13} />
              Goedgekeurd
            </span>
          ) : (
            <button
              onClick={() => setShowApproval(true)}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Check size={14} />
              Wireframe goedkeuren
            </button>
          )}
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
      <div>
        {currentPage?.page_components.map((component) => (
          <div key={component.id} className="relative group">
            <div className="overflow-hidden">
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
              Feedback geven
              {comments[component.id]?.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {comments[component.id].length}
                </span>
              )}
            </button>

            {/* Comment panel */}
            {commenting === component.id && (
              <div id={`feedback-panel-${component.id}`} className="bg-white border-t border-gray-100 shadow-lg p-4 space-y-3">
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
          <div className="text-center py-24 text-gray-400 bg-white border-t border-dashed border-gray-200">
            Deze pagina heeft nog geen inhoud.
          </div>
        )}
      </div>
    </div>
  )
}

function ApprovalModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)

  function handleConfirm() {
    setConfirming(true)
    setTimeout(() => { onConfirm() }, 600)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={17} className="text-[#2563EB]" />
            </div>
            <h2 className="font-semibold text-gray-900">Wireframe goedkeuren</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Je staat op het punt de wireframe officieel goed te keuren. Dit betekent dat je akkoord gaat met de voorgestelde structuur en inhoud als basis voor het verdere ontwerp- en ontwikkelproces.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-1">
              <p className="font-medium">Let op: dit is een definitieve beslissing</p>
              <ul className="text-amber-700 space-y-0.5 list-disc list-inside text-xs leading-relaxed">
                <li>Wijzigingen na goedkeuring kunnen extra kosten met zich meebrengen</li>
                <li>Het ontwerpproces start op basis van deze wireframe</li>
                <li>Structurele aanpassingen zijn nadien niet meer inbegrepen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <Check size={14} />
                Goedgekeurd!
              </>
            ) : (
              'Ja, ik keur de wireframe goed'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Reaction {
  id: string
  comment_id: string
  author_email: string
  reaction: string
}

const REACTIONS = [
  { key: 'thumbs_up', emoji: '👍' },
  { key: 'thumbs_down', emoji: '👎' },
  { key: 'check', emoji: '✅' },
]

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
  const [reactions, setReactions] = useState<Reaction[]>([])
  const isOwn = currentEmail && comment.author_email === currentEmail

  useEffect(() => {
    fetch(`/api/comments/reactions?comment_ids=${comment.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setReactions(Array.isArray(data) ? data : []))
  }, [comment.id])

  async function toggleReaction(reactionKey: string) {
    if (!currentEmail) return
    const res = await fetch('/api/comments/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: comment.id, author_email: currentEmail, reaction: reactionKey }),
    })
    const data = await res.json()
    if (data.removed) {
      setReactions((prev) => prev.filter((r) => !(r.comment_id === comment.id && r.author_email === currentEmail && r.reaction === reactionKey)))
    } else if (data.id) {
      setReactions((prev) => [...prev, data])
    }
  }

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

      {/* Reactions */}
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        {REACTIONS.map(({ key, emoji }) => {
          const reacted = reactions.filter((r) => r.reaction === key)
          const mine = reacted.some((r) => r.author_email === currentEmail)
          return (
            <div key={key} className="relative group/reaction">
              <button
                onClick={() => toggleReaction(key)}
                disabled={!currentEmail}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                  mine
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                } ${!currentEmail ? 'opacity-50 cursor-default' : ''}`}
              >
                <span>{emoji}</span>
                {reacted.length > 0 && <span className="font-medium">{reacted.length}</span>}
              </button>
              {reacted.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/reaction:block z-20 pointer-events-none">
                  <div className="bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    {reacted.map((r) => (
                      <div key={r.id}>{r.author_email}</div>
                    ))}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
