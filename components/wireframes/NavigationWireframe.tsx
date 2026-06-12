import { WireframeProps, Ph, LogoPh, BtnPh } from './shared'

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

  // default: simple
  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <LogoPh text={props.logo} />
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => <Ph key={i} w="w-14" h="h-2.5" />)}
        </div>
        <BtnPh text={props.cta} />
      </div>
    </nav>
  )
}
