'use client'

import { useState, useEffect } from 'react'
import { Plus, FolderOpen, MessageSquare, Clock, Pencil } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import NewProjectModal from '@/components/editor/NewProjectModal'
import EditProjectModal from '@/components/editor/EditProjectModal'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  function onCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    setShowNew(false)
  }

  function onUpdated(updated: Project) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditProject(null)
  }

  function onDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setEditProject(null)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Vicar Builder</span>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nieuw project
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Projecten</h1>
        <p className="text-gray-500 mb-8">Alle wireframe projecten voor jouw klanten</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
            <FolderOpen size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Nog geen projecten</p>
            <p className="text-gray-400 text-sm mt-1">Maak je eerste project aan</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-6 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Project aanmaken
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditProject(project)}
              />
            ))}
            <button
              onClick={() => setShowNew(true)}
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 h-48 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Nieuw project</span>
            </button>
          </div>
        )}
      </main>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={onCreated} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(editProject.id)}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, onEdit }: { project: Project; onEdit: () => void }) {
  return (
    <div className="relative bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
      <button
        onClick={(e) => { e.preventDefault(); onEdit() }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        title="Bewerken"
      >
        <Pencil size={14} />
      </button>

      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
            {project.logo_url ? (
              <Image
                src={project.logo_url}
                alt={project.client_name}
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <span className="text-gray-400 font-bold text-lg group-hover:text-blue-600 transition-colors">
                {project.client_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{project.client_name}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(project.updated_at)}
          </span>
          {project.unread_comments ? (
            <span className="flex items-center gap-1 text-orange-500">
              <MessageSquare size={12} />
              {project.unread_comments} reacties
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  )
}
