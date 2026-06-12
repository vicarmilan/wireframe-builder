'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Shield, User, Search, UserPlus, Send, X, Mail, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function UserAvatar({ user }: { user: ClerkUser }) {
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase()

  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']
  const color = colors[user.email.charCodeAt(0) % colors.length]

  if (!user.imageUrl || user.imageUrl.includes('gravatar')) {
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}>
        {initials}
      </div>
    )
  }

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
      <Image
        src={user.imageUrl}
        alt={user.name || user.email}
        width={32}
        height={32}
        className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${color}`}>
        {initials}
      </div>
    </div>
  )
}

interface ClerkUser {
  id: string
  email: string
  name: string | null
  imageUrl: string
  role: 'admin' | 'client'
  createdAt: number
  lastActiveAt: number | null
}

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'client'
  createdAt: number
}

interface ClientRecord {
  id: string
  name: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'client'>('client')
  const [inviteClientId, setInviteClientId] = useState<string>('new')
  const [inviteNewClientName, setInviteNewClientName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
    fetch('/api/admin/invitations')
      .then((r) => r.json())
      .then((data) => { setPendingInvitations(Array.isArray(data) ? data : []) })
    fetch('/api/admin/clients')
      .then((r) => r.json())
      .then((data) => { setClients(Array.isArray(data) ? data : []) })
  }, [])

  async function sendInvitation() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError('')
    const res = await fetch('/api/admin/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail.trim(),
        role: inviteRole,
        clientId: inviteRole === 'client' ? (inviteClientId === 'new' ? null : inviteClientId) : null,
        newClientName: inviteRole === 'client' && inviteClientId === 'new' ? inviteNewClientName.trim() : null,
      }),
    })
    const data = await res.json()
    setInviting(false)
    if (!res.ok) {
      setInviteError(data.error || 'Er ging iets mis')
      return
    }
    setInviteSuccess(true)
    setInviteEmail('')
    fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : []))
    fetch('/api/admin/invitations').then((r) => r.json()).then((d) => setPendingInvitations(Array.isArray(d) ? d : []))
    fetch('/api/admin/clients').then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []))
    setTimeout(() => {
      setInviteSuccess(false)
      setShowInvite(false)
      setInviteEmail('')
      setInviteNewClientName('')
      setInviteClientId('new')
    }, 2500)
  }

  async function revokeInvitation(invitationId: string) {
    await fetch('/api/admin/invitations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId }),
    })
    setPendingInvitations((prev) => prev.filter((i) => i.id !== invitationId))
  }

  async function setRole(userId: string, role: 'admin' | 'client') {
    setUpdating(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
    setUpdating(null)
  }

  async function deleteUser(userId: string) {
    if (!confirm('Deze gebruiker permanent verwijderen?')) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const admins = filtered.filter((u) => u.role === 'admin')
  const clientUsers = filtered.filter((u) => u.role === 'client')

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#2563EB]" />
            <h1 className="font-semibold text-gray-900">Gebruikersbeheer</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam of email..."
              className="pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={() => { setShowInvite(true); setInviteError(''); setInviteSuccess(false) }}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={15} />
            Uitnodigen
          </button>
        </div>
      </header>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#2563EB]" />
                <h2 className="font-semibold text-gray-900">Gebruiker uitnodigen</h2>
              </div>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-6 text-green-600 font-medium">Uitnodiging verstuurd!</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">E-mailadres</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendInvitation()}
                      placeholder="naam@bedrijf.be"
                      autoFocus
                      className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Rol</label>
                  <div className="flex gap-2">
                    {(['client', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setInviteRole(r)}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                          inviteRole === r
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {r === 'client' ? 'Klant' : 'Admin'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {inviteRole === 'client'
                      ? 'Krijgt toegang tot het klantportaal met hun projecten.'
                      : 'Heeft toegang tot het volledige dashboard.'}
                  </p>
                </div>

                {inviteRole === 'client' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Klant / Bedrijf</label>
                    <select
                      value={inviteClientId}
                      onChange={(e) => setInviteClientId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="new">+ Nieuwe klant aanmaken</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {inviteClientId === 'new' && (
                      <input
                        value={inviteNewClientName}
                        onChange={(e) => setInviteNewClientName(e.target.value)}
                        placeholder="Bedrijfsnaam"
                        className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                )}

                {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
                <button
                  onClick={sendInvitation}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                  {inviting ? 'Versturen...' : 'Uitnodiging versturen'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : (
          <>
            <Section
              title="Vicar team"
              icon={<Shield size={15} className="text-[#2563EB]" />}
              count={admins.length}
              description="Hebben toegang tot het dashboard en kunnen projecten aanmaken en bewerken."
            >
              {admins.map((user) => (
                <UserRow key={user.id} user={user} updating={updating === user.id} onSetRole={setRole} onDelete={deleteUser} />
              ))}
              {admins.length === 0 && <EmptyRow label="Geen admins gevonden" />}
            </Section>

            <Section
              title="Klanten"
              icon={<User size={15} className="text-gray-500" />}
              count={clientUsers.length}
              description="Kunnen enkel preview links bekijken en feedback geven."
            >
              {clientUsers.map((user) => (
                <UserRow key={user.id} user={user} updating={updating === user.id} onSetRole={setRole} onDelete={deleteUser} />
              ))}
              {clientUsers.length === 0 && <EmptyRow label="Geen klanten gevonden" />}
            </Section>

            {pendingInvitations.length > 0 && (
              <Section
                title="Openstaande uitnodigingen"
                icon={<Clock size={15} className="text-amber-500" />}
                count={pendingInvitations.length}
                description="Deze gebruikers hebben hun uitnodiging nog niet geaccepteerd."
              >
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Mail size={14} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 truncate">{inv.email}</div>
                      <div className="text-xs text-gray-400">Uitgenodigd als {inv.role === 'admin' ? 'Admin' : 'Klant'}</div>
                    </div>
                    <button
                      onClick={() => revokeInvitation(inv.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                    >
                      Intrekken
                    </button>
                  </div>
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Section({ title, icon, count, description, children }: {
  title: string
  icon: React.ReactNode
  count: number
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {children}
      </div>
    </div>
  )
}

function UserRow({ user, updating, onSetRole, onDelete }: {
  user: ClerkUser
  updating: boolean
  onSetRole: (id: string, role: 'admin' | 'client') => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <UserAvatar user={user} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">{user.name || '—'}</div>
        <div className="text-xs text-gray-400 truncate">{user.email}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          user.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {user.role === 'admin' ? 'Admin' : 'Klant'}
        </span>
        <select
          value={user.role}
          disabled={updating}
          onChange={(e) => onSetRole(user.id, e.target.value as 'admin' | 'client')}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
        >
          <option value="client">Klant</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => onDelete(user.id)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Verwijderen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-5 py-4 text-sm text-gray-400">{label}</div>
}
