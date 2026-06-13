'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, X, ArrowRight } from 'lucide-react'

export interface Notif {
  id: string
  type: 'comment' | 'reaction'
  page_component_id: string
  author_name: string
  content?: string
  reaction?: string
  comment_preview?: string
  created_at: string
  project_name: string
  preview_token: string
  read_at?: string | null
}

const REACTION_EMOJI: Record<string, string> = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  check: '✅',
}

const POLL_INTERVAL = 30_000

interface Toast {
  id: string
  notif: Notif
}

export default function NotificationBell({
  apiUrl,
  markReadUrl,
  historyUrl,
}: {
  apiUrl: string
  markReadUrl?: string
  historyUrl?: string
}) {
  // shownNotifs: persists between polls, only removed by explicit dismiss
  const [shownNotifs, setShownNotifs] = useState<Notif[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const initialLoad = useRef(true)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch(apiUrl)
      if (!res.ok) return
      const data: Notif[] = await res.json()
      if (!Array.isArray(data)) return

      // Merge new notifications into shownNotifs (never remove automatically)
      setShownNotifs((prev) => {
        const existingIds = new Set(prev.map((n) => n.id))
        const incoming = data.filter((n) => !existingIds.has(n.id))
        return incoming.length ? [...incoming, ...prev] : prev
      })

      // Show toasts only on subsequent polls, for truly new items
      if (!initialLoad.current) {
        const fresh = data.filter((n) => !seenIds.current.has(n.id))
        fresh.forEach((n) => {
          const toast: Toast = { id: n.id, notif: n }
          setToasts((prev) => [...prev.slice(-2), toast])
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== n.id))
          }, 5000)
        })
      }

      data.forEach((n) => seenIds.current.add(n.id))
      initialLoad.current = false
    } catch {
      // silently ignore
    }
  }, [apiUrl])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowPanel(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function dismissOne(notif: Notif) {
    setShownNotifs((prev) => prev.filter((n) => n.id !== notif.id))
    const url = markReadUrl ?? apiUrl
    try {
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifId: notif.id }),
      })
    } catch { /* ignore */ }
  }

  async function dismissAll() {
    setShownNotifs([])
    setShowPanel(false)
    const url = markReadUrl ?? apiUrl
    try {
      await fetch(url, { method: 'PATCH' })
    } catch { /* ignore */ }
  }

  const notifHref = (n: Notif) =>
    n.preview_token ? `/preview/${n.preview_token}#feedback-panel-${n.page_component_id}` : '#'

  const unreadCount = shownNotifs.length

  return (
    <>
      {/* Bell button + panel */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setShowPanel((v) => !v)}
          className="relative flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showPanel && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-900">
                Meldingen{unreadCount > 0 && <span className="text-gray-400 font-normal ml-1">({unreadCount})</span>}
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={dismissAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Alles wissen
                  </button>
                )}
                <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {shownNotifs.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  <Bell size={24} className="mx-auto mb-2 text-gray-200" />
                  Geen nieuwe meldingen
                </div>
              ) : (
                shownNotifs.map((n) => (
                  <div key={n.id} className="flex items-start gap-0 border-b border-gray-50 last:border-0 group relative">
                    <Link
                      href={notifHref(n)}
                      onClick={() => setShowPanel(false)}
                      className="flex gap-3 px-4 py-3 hover:bg-gray-50 flex-1 min-w-0"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
                          {(n.author_name || '?').charAt(0).toUpperCase()}
                        </div>
                        {n.type === 'reaction' && (
                          <span className="absolute -bottom-1 -right-1 text-sm leading-none">
                            {REACTION_EMOJI[n.reaction ?? ''] ?? '👍'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-gray-900">{n.author_name}</span>
                          <span className="text-xs text-gray-400">{n.type === 'reaction' ? 'reageerde op' : 'op'}</span>
                          <span className="text-xs font-medium text-blue-600 truncate group-hover:underline">{n.project_name}</span>
                        </div>
                        {n.type === 'reaction' && n.comment_preview && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">&ldquo;{n.comment_preview}&rdquo;</p>
                        )}
                        {n.type === 'comment' && (
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.content}</p>
                        )}
                      </div>
                    </Link>
                    {/* Per-notification dismiss button */}
                    <button
                      onClick={() => dismissOne(n)}
                      className="flex-shrink-0 self-start mt-3 mr-3 p-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      title="Verwijderen"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer: link to full history */}
            {historyUrl && (
              <Link
                href={historyUrl}
                onClick={() => setShowPanel(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-t border-gray-100 transition-colors font-medium"
              >
                Volledige geschiedenis bekijken
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <Link
            key={t.id}
            href={notifHref(t.notif)}
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 w-72 animate-slide-in"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                {(t.notif.author_name || '?').charAt(0).toUpperCase()}
              </div>
              {t.notif.type === 'reaction' && (
                <span className="absolute -bottom-1 -right-1 text-sm leading-none">
                  {REACTION_EMOJI[t.notif.reaction ?? ''] ?? '👍'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">{t.notif.author_name}</p>
              <p className="text-xs text-gray-500 truncate">
                {t.notif.type === 'reaction'
                  ? `${REACTION_EMOJI[t.notif.reaction ?? ''] ?? '👍'} op "${t.notif.comment_preview ?? ''}"`
                  : t.notif.content}
              </p>
              <p className="text[10px] text-blue-500 font-medium mt-0.5">{t.notif.project_name}</p>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); setToasts((prev) => prev.filter((x) => x.id !== t.id)) }}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0"
            >
              <X size={13} />
            </button>
          </Link>
        ))}
      </div>
    </>
  )
}
