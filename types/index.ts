export type UserRole = 'admin' | 'client'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  client_name: string
  logo_url?: string
  owner_id: string
  preview_token: string
  created_at: string
  updated_at: string
  // computed
  pages?: Page[]
  unread_comments?: number
}

export interface Page {
  id: string
  project_id: string
  name: string
  slug: string
  order: number
  created_at: string
  updated_at: string
  // computed
  components?: PageComponent[]
}

export interface PageComponent {
  id: string
  page_id: string
  component_type: ComponentType
  component_variant: string
  order: number
  props: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  page_component_id: string
  author_id: string
  author_name: string
  author_email: string
  content: string
  resolved: boolean
  created_at: string
}

export type ComponentType =
  | 'navigation'
  | 'hero'
  | 'features'
  | 'stats'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'portfolio'
  | 'team'
  | 'blog'
  | 'faq'
  | 'contact'
  | 'footer'
  | 'restaurant'
  | 'hotel'
  | 'marketplace'

export interface ComponentDefinition {
  type: ComponentType
  variant: string
  label: string
  description: string
  fields: FieldDefinition[]
  previewHeight?: number
}

export interface FieldDefinition {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url'
  placeholder?: string
  group?: string
}
