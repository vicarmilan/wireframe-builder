'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { Project, ProjectStatus } from '@/types'
import Image from 'next/image'

interface Client {
  id: string
  name: string
}

interface Props {
  project: Project
  onClose: () => void
  onUpdated: (project: Project) => void
  onDeleted: () => void
}

export default function EditProjectModal({ project, onClose, onUpdated, onDeleted }: Props) {
  const [name, setName] = useState(project.name)
  const [clientId, setClientId] = useState((project as Project & { client_id?: string }).client_id ?? '')
  const [clients, setClients] = useState<Client[]>([])
  const [logoUrl, setLogoUrl] = useState(project.logo_url || '')
  const [status, setStatus] = useState<ProjectStatus>(project.status ?? 'in_progress')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload/logo', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Upload mislukt'); setUploading(false); return }
    setLogoUrl(data.url)
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !clientId) return
    setSaving(true)
    setError('')

    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), client_id: clientId, logo_url: logoUrl || null, status }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Opslaan mislukt'); setSaving(false); return }
    onUpdated(data)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    if (!res.ok) { setError('Verwijderen mislukt'); setDeleting(false); return }
    onDeleted()
  }

  const selectedClient = clients.find((c) => c.id === clientId)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Project bewerken</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {!confirmDelete ? (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" width={56} height={56} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xl font-bold text-gray-300">
                      {(selectedClient?.name ?? project.client_name ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Upload size={13} />
                    {uploading ? 'Uploaden...' : 'Logo uploaden'}
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="border border-gray-200 text-gray-400 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 hover:text-red-500 transition-colors"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WebP of SVG, max 2MB</p>
            </div>

            {/* Naam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Projectnaam</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Klant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Klant</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecteer een klant...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clientId && (
                <p className="text-xs text-gray-400 mt-1">
                  Alle gebruikers van dit bedrijf krijgen automatisch toegang tot de preview.
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status (als toegang aan staat)</label>
              <div className="flex gap-2">
                {([
                  { value: 'pending_review', label: 'Wachten op feedback' },
                  { value: 'approved', label: 'Goedgekeurd' },
                ] as { value: ProjectStatus; label: string }[]).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(status === option.value ? 'in_progress' : option.value)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      status === option.value
                        ? option.value === 'pending_review'
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Trash2 size={14} />
                Verwijderen
              </button>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !clientId}
                  className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 text-sm">Project verwijderen?</p>
                <p className="text-red-600 text-sm mt-1">
                  Dit verwijdert <strong>{project.name}</strong>{' '}inclusief alle pagina&apos;s en componenten. Dit kan niet ongedaan worden gemaakt.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Verwijderen...' : 'Ja, verwijderen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
