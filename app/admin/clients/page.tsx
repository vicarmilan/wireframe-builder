'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Building2, Plus, Pencil, Trash2, Users, Check, X, ChevronDown, ChevronUp, UserPlus, Search, Camera } from 'lucide-react'
import Link from 'next/link'

interface ClientUser {
  user_id: string
  email: string
  name: string | null
  imageUrl: string
}

interface Client {
  id: string
  name: string
  logo_url?: string | null
  created_at: string
  client_users: ClientUser[]
}

interface AllUser {
  id: string
  email: string
  name: string | null
  imageUrl: string
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/clients').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ]).then(([c, u]) => {
      setClients(Array.isArray(c) ? c : [])
      // users API returns { users, invitations } or flat array
      const usersArr = Array.isArray(u) ? u : (u.users ?? [])
      setAllUsers(usersArr.map((u: { id: string; email?: string; emailAddresses?: {emailAddress: string}[]; firstName?: string; lastName?: string; imageUrl?: string; name?: string }) => ({
        id: u.id,
        email: u.email ?? u.emailAddresses?.[0]?.emailAddress ?? '',
        name: u.name ?? ([u.firstName, u.lastName].filter(Boolean).join(' ') || null),
        imageUrl: u.imageUrl ?? '',
      })))
      setLoading(false)
    })
  }, [])

  async function addClient() {
    if (!newName.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const data = await res.json()
    setAdding(false)
    if (res.ok) {
      setClients((prev) => [...prev, { ...data, client_users: [] }].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setShowAdd(false)
    }
  }

  async function deleteClient(clientId: string, name: string) {
    if (!confirm(`Bedrijf "${name}" permanent verwijderen? Alle gekoppelde gebruikers worden ontkoppeld.`)) return
    await fetch('/api/admin/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    setClients((prev) => prev.filter((c) => c.id !== clientId))
  }

  function updateClient(updated: Client) {
    setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c))
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#2563EB]" />
            <h1 className="font-semibold text-gray-900">Bedrijven</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100">
            Gebruikers
          </Link>
          <button
            onClick={() => { setShowAdd(true); setNewName('') }}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Bedrijf toevoegen
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {showAdd && (
          <div className="bg-white rounded-xl border border-blue-200 p-4 mb-6 flex items-center gap-3">
            <Building2 size={16} className="text-[#2563EB] flex-shrink-0" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addClient(); if (e.key === 'Escape') setShowAdd(false) }}
              placeholder="Bedrijfsnaam"
              autoFocus
              className="flex-1 text-sm focus:outline-none"
            />
            <button
              onClick={addClient}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Check size={13} />
              {adding ? 'Toevoegen...' : 'Toevoegen'}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Nog geen bedrijven</p>
            <p className="text-sm text-gray-400">Voeg een bedrijf toe om klanten aan te koppelen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                allUsers={allUsers}
                expanded={expandedId === client.id}
                onToggle={() => setExpandedId(expandedId === client.id ? null : client.id)}
                onUpdate={updateClient}
                onDelete={() => deleteClient(client.id, client.name)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ClientCard({
  client,
  allUsers,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  client: Client
  allUsers: AllUser[]
  expanded: boolean
  onToggle: () => void
  onUpdate: (c: Client) => void
  onDelete: () => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(client.name)
  const [saving, setSaving] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowAddUser(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function saveName() {
    if (!editName.trim() || editName === client.name) { setEditingName(false); return }
    setSaving(true)
    const res = await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, name: editName.trim() }),
    })
    setSaving(false)
    if (res.ok) {
      onUpdate({ ...client, name: editName.trim() })
      setEditingName(false)
    }
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    const form = new FormData()
    form.append('file', file)
    const uploadRes = await fetch('/api/upload/logo', { method: 'POST', body: form })
    if (!uploadRes.ok) { setUploadingLogo(false); return }
    const { url } = await uploadRes.json()
    await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-logo', clientId: client.id, logo_url: url }),
    })
    onUpdate({ ...client, logo_url: url })
    setUploadingLogo(false)
  }

  async function removeUser(userId: string) {
    await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove-user', clientId: client.id, userId }),
    })
    onUpdate({ ...client, client_users: client.client_users.filter((u) => u.user_id !== userId) })
  }

  async function addUser(userId: string) {
    const res = await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-user', clientId: client.id, userId }),
    })
    if (res.ok) {
      const newUser = await res.json()
      onUpdate({ ...client, client_users: [...client.client_users, newUser] })
      setShowAddUser(false)
      setSearch('')
    }
  }

  const existingIds = new Set(client.client_users.map((u) => u.user_id))
  const filteredUsers = allUsers.filter(
    (u) => !existingIds.has(u.id) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Logo upload */}
        <div
          className="relative w-10 h-10 rounded-lg flex-shrink-0 cursor-pointer group/logo"
          onClick={() => logoInputRef.current?.click()}
          title="Profielfoto instellen"
        >
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = '' }}
          />
          {uploadingLogo ? (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : client.logo_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={client.logo_url} alt={client.name} className="w-full h-full object-contain rounded-lg bg-gray-50 p-0.5" />
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={14} className="text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-blue-50 rounded-lg flex items-center justify-center group-hover/logo:bg-blue-100 transition-colors">
              <Building2 size={16} className="text-[#2563EB] group-hover/logo:hidden" />
              <Camera size={14} className="text-[#2563EB] hidden group-hover/logo:block" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                autoFocus
                className="text-sm font-medium text-gray-900 border-b border-blue-400 focus:outline-none bg-transparent"
              />
              <button onClick={saveName} disabled={saving} className="text-blue-600 hover:text-blue-800 p-0.5">
                <Check size={14} />
              </button>
              <button onClick={() => setEditingName(false)} className="text-gray-400 hover:text-gray-600 p-0.5">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="font-medium text-sm text-gray-900">{client.name}</div>
          )}
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
            <Users size={11} />
            {client.client_users.length} gebruiker{client.client_users.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditingName(true); setEditName(client.name) }}
            className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Naam bewerken"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Verwijderen"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ml-1"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded user list */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-4 pt-3 space-y-3">
          {client.client_users.length === 0 ? (
            <p className="text-xs text-gray-400 py-2 text-center">Nog geen gebruikers gekoppeld aan dit bedrijf.</p>
          ) : (
            <div className="space-y-2">
              {client.client_users.map((u) => (
                <div key={u.user_id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {u.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.imageUrl} alt={u.name ?? u.email} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xs font-semibold">
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {u.name && <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>}
                    <div className="text-xs text-gray-400 truncate">{u.email || u.user_id}</div>
                  </div>
                  <button
                    onClick={() => removeUser(u.user_id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                    title="Ontkoppelen"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add user */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowAddUser(!showAddUser); setSearch('') }}
              className="flex items-center gap-2 text-sm text-[#2563EB] hover:text-blue-700 font-medium py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UserPlus size={14} />
              Gebruiker toevoegen
            </button>

            {showAddUser && (
              <div className="absolute left-0 top-9 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-2 border-b border-gray-50">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Zoek op naam of e-mail..."
                      className="text-xs bg-transparent focus:outline-none flex-1"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Geen gebruikers gevonden</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => addUser(u.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          {u.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.imageUrl} alt={u.name ?? u.email} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-500 text-xs font-semibold">
                              {(u.name || u.email || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {u.name && <div className="text-xs font-medium text-gray-900 truncate">{u.name}</div>}
                          <div className="text-xs text-gray-400 truncate">{u.email}</div>
                        </div>
                        <Plus size={13} className="text-blue-400 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
