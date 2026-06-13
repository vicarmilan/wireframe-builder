'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, useClerk, UserProfile } from '@clerk/nextjs'
import { LogOut, Settings, X } from 'lucide-react'

export default function UserDropdown() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!user) return null

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.primaryEmailAddress?.emailAddress ||
    ''

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((n) => n![0])
      .join('') ||
    user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    '?'

  function Avatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
    const cls = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-sm'
    return (
      <div
        className={`${cls} rounded-full overflow-hidden flex-shrink-0 bg-purple-600 flex items-center justify-center text-white font-semibold`}
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
    )
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full border-2 border-gray-200 hover:border-blue-400 transition-colors"
          aria-label="Accountmenu"
        >
          <Avatar size="sm" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <Avatar />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); setShowProfile(true) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={15} className="text-gray-400" />
                Profiel beheren
              </button>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut size={15} className="text-gray-400" />
                Afmelden
              </button>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfile(false) }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors bg-white"
              aria-label="Sluiten"
            >
              <X size={15} className="text-gray-500" />
            </button>
            <UserProfile
              appearance={{
                variables: { colorPrimary: '#2563EB' },
                elements: {
                  rootBox: { width: '100%' },
                  card: { border: 'none', boxShadow: 'none', borderRadius: 0, margin: 0 },
                  footer: { display: 'none' },
                  footerAction: { display: 'none' },
                  footerActionLink: { display: 'none' },
                  pageScrollBox: { padding: '24px 32px' },
                  navbar: {
                    background: '#f9fafb',
                    borderRight: '1px solid #f3f4f6',
                    padding: '20px 12px',
                  },
                  navbarButton: { borderRadius: '8px' },
                  headerTitle: { fontSize: '17px', fontWeight: '600' },
                  headerSubtitle: { display: 'none' },
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
