import { create } from 'zustand'
import { Page, PageComponent } from '@/types'

interface EditorState {
  page: Page | null
  components: PageComponent[]
  selectedId: string | null
  editingId: string | null
  sidebarOpen: boolean

  setPage: (page: Page) => void
  setComponents: (components: PageComponent[]) => void
  addComponent: (component: PageComponent) => void
  updateComponent: (id: string, props: Record<string, string>) => void
  removeComponent: (id: string) => void
  reorderComponents: (components: PageComponent[]) => void
  setSelected: (id: string | null) => void
  setEditing: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  page: null,
  components: [],
  selectedId: null,
  editingId: null,
  sidebarOpen: true,

  setPage: (page) => set({ page }),
  setComponents: (components) => set({ components }),
  addComponent: (component) =>
    set((state) => ({ components: [...state.components, component] })),
  updateComponent: (id, props) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, ...props } } : c
      ),
    })),
  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  reorderComponents: (components) => set({ components }),
  setSelected: (id) => set({ selectedId: id, editingId: null }),
  setEditing: (id) => set({ editingId: id, selectedId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
