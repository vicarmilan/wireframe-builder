'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ExternalLink, Layout, Clock } from 'lucide-react'
import { Project } from '@/types'

interface PortalData {
  projects: Project[]
  client: { id: string; name: string } | null
}

export default function PortalPage() {
  const { user } = useUser()
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/projects')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || ''

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            {data?.client?.name ?? 'Mijn projecten'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          <UserButton afterSignOutUrl="/login" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : !data?.projects.length ? (
          <EmptyState name={firstName} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                Goeiedag{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.projects.length === 1
                  ? 'Hier is je project.'
                  : `Je hebt ${data.projects.length} projecten.`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Layout size={18} className="text-[#2563EB]" />
        </div>
        <Link
          href={`/preview/${project.preview_token}`}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#2563EB] transition-colors"
        >
          <ExternalLink size={13} />
          Preview bekijken
        </Link>
      </div>
      <h3 className="font-semibold text-gray-900 mb-0.5">{project.name}</h3>
      <p className="text-xs text-gray-400">{project.client_name}</p>
      <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-300">
        <Clock size={11} />
        {new Date(project.updated_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
  )
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Layout size={24} className="text-gray-300" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Welkom{name ? `, ${name}` : ''}!
      </h2>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Er zijn nog geen projecten voor jou klaargemaakt. Het Vicar team werkt eraan.
      </p>
    </div>
  )
}
