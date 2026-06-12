import { WireframeProps, Ph, LogoPh, BtnPh, Tx } from './shared'

export default function NavigationWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'centered') {
    return (
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <LogoPh text={props.logo} />
          <div className="flex gap-6">
            {[...Array(5)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" />)}
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'mega') {
    return (
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <LogoPh text={props.logo} />
          <div className="flex gap-6 items-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <Ph w="w-14" h="h-2.5" />
                <div className="w-2 h-2 border-b border-r border-gray-400 rotate-45 mt-[-4px]" />
              </div>
            ))}
          </div>
          <BtnPh text={props.cta} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
        </div>
      </nav>
    )
  }

  if (variant === 'announcement') {
    return (
      <nav className="bg-white border-b border-gray-100">
        <div className="bg-[#2563EB] px-8 py-2 flex items-center justify-center gap-3">
          <Ph w="w-48" h="h-2" className="bg-white/30" />
          <div className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full">
            <Tx value={props.badge} fieldKey="badge" placeholder="New" editing={editing} onPropChange={onPropChange} className="" barWidth="w-8" />
          </div>
          <Ph w="w-28" h="h-2" className="bg-white/20" />
        </div>
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
          <LogoPh text={props.logo} />
          <div className="flex gap-6">
            {[...Array(4)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" />)}
          </div>
          <div className="flex gap-2">
            <div className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded">
              <Tx value={props.login} fieldKey="login" placeholder="Login" editing={editing} onPropChange={onPropChange} className="" barWidth="w-8" />
            </div>
            <BtnPh text={props.cta} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'search') {
    return (
      <nav className="bg-white border-b border-gray-100 px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <LogoPh text={props.logo} />
          <div className="flex-1 max-w-sm flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-3 py-2">
              <Ph w="w-4" h="h-4" className="rounded-full flex-shrink-0" />
              <Ph w="w-full" h="h-2.5" />
            </div>
            <div className="bg-[#2563EB] text-white text-xs px-3 py-2 font-medium">Zoek</div>
          </div>
          <div className="flex items-center gap-5 ml-auto">
            {[...Array(2)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" />)}
            <div className="w-px h-5 bg-gray-200" />
            <div className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded">Login</div>
            <BtnPh text={props.cta} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'dark') {
    return (
      <nav className="bg-gray-900 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2563EB] rounded" />
            <Ph w="w-20" h="h-3" className="bg-white/80" />
          </div>
          <div className="flex gap-6">
            {[...Array(4)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" className="bg-white/40" />)}
          </div>
          <div className="flex gap-2">
            <div className="border border-white/30 text-white/70 text-xs px-3 py-1.5 rounded">Login</div>
            <BtnPh text={props.cta} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'transparent') {
    return (
      <div className="relative">
        <div className="bg-[#C8CFD8] h-28 rounded-xl" />
        <div className="absolute top-0 left-0 right-0 px-8 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/90 rounded" />
            <Ph w="w-20" h="h-2.5" className="bg-white/90" />
          </div>
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" className="bg-white/80" />)}
          </div>
          <div className="bg-white text-[#2563EB] font-semibold text-xs px-4 py-2 rounded">
            <Tx value={props.cta} fieldKey="cta" placeholder="Reserveer" editing={editing} onPropChange={onPropChange} className="" barWidth="w-16" />
          </div>
        </div>
      </div>
    )
  }

  // default: simple
  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <LogoPh text={props.logo} />
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" />)}
        </div>
        <BtnPh text={props.cta} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
      </div>
    </nav>
  )
}
