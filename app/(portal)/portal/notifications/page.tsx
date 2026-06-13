'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, MessageCircle, Smile } from 'lucide-react'
import type { Notif } from '@/components/shared/NotificationBell'

const REACTION_EMOJI: Record<string, string> = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  check: '✅',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Zojuist'
  if (mins < 60) return `${mins}m geleden`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}u geleden`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d geleden`
  return new Date(dateStr).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PortalNotificationsHistoryPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/notifications?all=true')
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setNotifs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/portal" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-semibold text-gray-900">Meldingengeschiedenis</h1>
          <p className="text-xs text-gray-400 mt-0.5">Alle ontvangen meldingen, inclusief gelezen en gewiste</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex gap-3">
                <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-2/5 mb-2" />
                  <div className="skeleton h-3 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={22} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Geen meldingen gevonden</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => (
              <Link
                key={n.id}
                href={n.preview_token ? `/preview/${n.preview_token}#feedback-panel-${n.page_component_id}` : '#'}
                className={`flex gap-3 bg-white rounded-xl px-4 py-3.5 hover:shadow-sm transition-shadow group border ${n.read_at ? 'border-gray-100 opacity-70' : 'border-blue-100'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">
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
                    <span className="text-sm font-semibold text-gray-900">{n.author_name}</span>
                    <span className="text-xs text-gray-400">{n.type === 'reaction' ? 'reageerde op' : 'gaf feedback op'}</span>
                    <span className="text-xs font-medium text-blue-600 group-hover:underline truncate">{n.project_name}</span>
                  </div>
                  {n.type === 'reaction' && n.comment_preview && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">&ldquo;{n.comment_preview}&rdquo;</p>
                  )}
                  {n.type === 'comment' && n.content && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.content}</p>
                  )}
                  <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {n.type === 'comment' ? (
                    <MessageCircle size={13} className="text-gray-300" />
                  ) : (
                    <Smile size={13} className="text-gray-300" />
                  )}
                  {!n.read_at && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
