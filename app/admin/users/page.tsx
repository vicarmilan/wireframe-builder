'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Shield, User, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ClerkUser {
  id: string
  email: string
  name: string | null
  imageUrl: string
  role: 'admin' | 'client'
  createdAt: number
  lastActiveAt: number | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

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

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const admins = filtered.filter((u) => u.role === 'admin')
  const clients = filtered.filter((u) => u.role === 'client')

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
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam of email..."
            className="pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </header>

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
                <UserRow key={user.id} user={user} updating={updating === user.id} onSetRole={setRole} />
              ))}
              {admins.length === 0 && <EmptyRow label="Geen admins gevonden" />}
            </Section>

            <Section
              title="Klanten"
              icon={<User size={15} className="text-gray-500" />}
              count={clients.length}
              description="Kunnen enkel preview links bekijken en feedback geven."
            >
              {clients.map((user) => (
                <UserRow key={user.id} user={user} updating={updating === user.id} onSetRole={setRole} />
              ))}
              {clients.length === 0 && <EmptyRow label="Geen klanten gevonden" />}
            </Section>
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

function UserRow({ user, updating, onSetRole }: {
  user: ClerkUser
  updating: boolean
  onSetRole: (id: string, role: 'admin' | 'client') => void
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        <Image src={user.imageUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
      </div>
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
      </div>
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-5 py-4 text-sm text-gray-400">{label}</div>
}
