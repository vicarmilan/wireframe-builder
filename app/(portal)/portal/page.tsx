'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Layout, Clock } from 'lucide-react'
import { Project, PageComponent } from '@/types'
import WireframeComponent from '@/components/wireframes/WireframeComponent'

const PREVIEW_INNER_WIDTH = 1280
const PREVIEW_SCALE = 0.27
const PREVIEW_HEIGHT = 180

function CardPreview({ projectId }: { projectId: string }) {
  const [components, setComponents] = useState<PageComponent[] | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/pages`)
      .then((r) => r.json())
      .then((pages) => {
        if (!Array.isArray(pages) || pages.length === 0) { setComponents([]); return }
        const firstPage = pages.sort((a: { order: number }, b: { order: number }) => a.order - b.order)[0]
        return fetch(`/api/pages/${firstPage.id}/components`).then((r) => r.json())
      })
      .then((comps) => {
        if (!comps) return
        const sorted = Array.isArray(comps) ? comps.sort((a: PageComponent, b: PageComponent) => a.order - b.order) : []
        setComponents(sorted.slice(0, 5))
      })
      .catch(() => setComponents([]))
  }, [projectId])

  if (components === null) {
    return <div className="skeleton w-full" style={{ height: PREVIEW_HEIGHT }} />
  }

  if (components.length === 0) {
    return (
      <div className="w-full bg-gray-50 flex items-center justify-center text-gray-300 text-xs" style={{ height: PREVIEW_HEIGHT }}>
        Geen componenten
      </div>
    )
  }

  return (
    <div style={{ height: PREVIEW_HEIGHT, overflow: 'hidden', position: 'relative', background: 'white' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: PREVIEW_INNER_WIDTH,
        transformOrigin: 'top left',
        transform: `scale(${PREVIEW_SCALE})`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        {components.map((comp) => (
          <WireframeComponent key={comp.id} component={comp} editing={false} onPropChange={() => {}} />
        ))}
      </div>
    </div>
  )
}

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
      .then((r) => r.ok ? r.json() : { projects: [], client: null })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setData({ projects: [], client: null }); setLoading(false) })
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
          <UserButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="skeleton w-10 h-10 rounded-xl mb-4" />
                <div className="skeleton h-4 w-2/5 mb-2" />
                <div className="skeleton h-3 w-1/4 mb-5" />
                <div className="skeleton h-3 w-24" />
              </div>
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
    <Link
      href={`/preview/${project.preview_token}`}
      className="block bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all overflow-hidden"
    >
      <div className="border-b border-gray-100">
        <CardPreview projectId={project.id} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{project.name}</h3>
        <p className="text-xs text-gray-400">{project.client_name}</p>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-300">
          <Clock size={11} />
          {new Date(project.updated_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </Link>
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
