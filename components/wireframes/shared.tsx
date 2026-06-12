// Shared wireframe primitives

export interface WireframeProps {
  props: Record<string, string>
  variant: string
  editing: boolean
  onPropChange: (key: string, value: string) => void
}

// Placeholder bar (gray rectangle)
export function Ph({ w = 'w-full', h = 'h-3', className = '' }: { w?: string; h?: string; className?: string }) {
  return <div className={`bg-[#C8CFD8] rounded ${w} ${h} ${className}`} />
}

// Image placeholder
export function ImgPh({ className = '', aspect = 'aspect-video' }: { className?: string; aspect?: string }) {
  return (
    <div className={`bg-[#C8CFD8] rounded-lg flex items-center justify-center ${aspect} ${className}`}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  )
}

// Avatar placeholder
export function AvatarPh({ size = 'w-10 h-10' }: { size?: string }) {
  return <div className={`bg-[#C8CFD8] rounded-full ${size} flex-shrink-0`} />
}

// Text block — shows value or placeholder bar
export function Tx({
  value,
  fieldKey,
  placeholder,
  editing,
  onPropChange,
  className = '',
  barWidth = 'w-48',
  multiline = false,
}: {
  value?: string
  fieldKey: string
  placeholder: string
  editing: boolean
  onPropChange: (k: string, v: string) => void
  className?: string
  barWidth?: string
  multiline?: boolean
}) {
  if (editing) {
    if (multiline) {
      return (
        <textarea
          value={value ?? ''}
          onChange={(e) => onPropChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className={`bg-transparent border border-blue-300 rounded px-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 w-full ${className}`}
          rows={3}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )
    }
    return (
      <input
        value={value ?? ''}
        onChange={(e) => onPropChange(fieldKey, e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent border border-blue-300 rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 min-w-0 w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
    )
  }
  if (value) return <div className={className}>{value}</div>
  return <Ph w={barWidth} />
}

// Blue button placeholder
export function BtnPh({ text, className = '', editing, fieldKey, onPropChange, light = false }: {
  text?: string
  className?: string
  editing?: boolean
  fieldKey?: string
  onPropChange?: (k: string, v: string) => void
  light?: boolean
}) {
  const bg = light ? 'bg-white' : 'bg-[#2563EB]'
  const fg = light ? 'text-[#2563EB]' : 'text-white'
  const phClass = light ? 'bg-[#2563EB]/30' : 'bg-white/50'
  if (editing && fieldKey && onPropChange) {
    return (
      <div
        className={`inline-flex items-center justify-center ${bg} ${fg} text-xs font-medium px-4 py-2 rounded ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          value={text ?? ''}
          onChange={(e) => onPropChange(fieldKey, e.target.value)}
          placeholder="Knoptekst"
          className={`bg-transparent ${fg} placeholder:opacity-60 focus:outline-none text-center min-w-0`}
          style={{ width: Math.max(64, (text?.length ?? 8) * 8) }}
          autoFocus={false}
        />
      </div>
    )
  }
  return (
    <div className={`inline-flex items-center justify-center ${bg} ${fg} text-xs font-medium px-4 py-2 rounded ${className}`}>
      {text || <Ph w="w-16" h="h-3" className={phClass} />}
    </div>
  )
}

// Outline button placeholder
export function BtnOutlinePh({ text, className = '', editing, fieldKey, onPropChange }: {
  text?: string
  className?: string
  editing?: boolean
  fieldKey?: string
  onPropChange?: (k: string, v: string) => void
}) {
  if (editing && fieldKey && onPropChange) {
    return (
      <div
        className={`inline-flex items-center justify-center border border-[#C8CFD8] text-gray-500 text-xs font-medium px-4 py-2 rounded ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          value={text ?? ''}
          onChange={(e) => onPropChange(fieldKey, e.target.value)}
          placeholder="Knoptekst"
          className="bg-transparent text-gray-500 placeholder:text-gray-400 focus:outline-none text-center min-w-0"
          style={{ width: Math.max(64, (text?.length ?? 8) * 8) }}
        />
      </div>
    )
  }
  return (
    <div className={`inline-flex items-center justify-center border border-[#C8CFD8] text-gray-500 text-xs font-medium px-4 py-2 rounded ${className}`}>
      {text || <Ph w="w-16" h="h-3" />}
    </div>
  )
}

// Logo placeholder
export function LogoPh({ text }: { text?: string }) {
  if (text) return <div className="font-bold text-gray-800 text-sm">{text}</div>
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-[#2563EB] rounded" />
      <Ph w="w-20" h="h-3" />
    </div>
  )
}

// Section wrapper
export function Section({ children, className = '', dark = false, blue = false }: {
  children: React.ReactNode
  className?: string
  dark?: boolean
  blue?: boolean
}) {
  return (
    <section className={`py-16 px-8 ${dark ? 'bg-gray-900' : blue ? 'bg-[#2563EB]' : 'bg-white'} ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

// Stars row
export function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-3 h-3 bg-[#2563EB] rounded-sm" />
      ))}
    </div>
  )
}

// Icon placeholder
export function IconPh({ size = 'w-10 h-10' }: { size?: string }) {
  return <div className={`bg-blue-100 rounded-lg ${size} flex-shrink-0`} />
}
