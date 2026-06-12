import { WireframeProps, Ph, LogoPh, Tx } from './shared'

export default function FooterWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'multi-column') {
    return (
      <footer className="bg-gray-900 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 space-y-3">
              <LogoPh text={props.logo} />
              <Tx
                value={props.tagline}
                fieldKey="tagline"
                placeholder="Jouw omschrijving hier"
                editing={editing}
                onPropChange={onPropChange}
                className="text-gray-400 text-sm"
                barWidth="w-full"
                multiline={true}
              />
            </div>
            {[...Array(3)].map((_, col) => (
              <div key={col} className="space-y-3">
                <Ph w="w-20" h="h-3" className="bg-white/20" />
                {[...Array(4)].map((_, i) => (
                  <Ph key={i} w="w-24" h="h-2.5" className="bg-white/10" />
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex items-center justify-between">
            <Tx
              value={props.copyright}
              fieldKey="copyright"
              placeholder="© 2025 Bedrijfsnaam."
              editing={editing}
              onPropChange={onPropChange}
              className="text-gray-400 text-xs"
              barWidth="w-48"
            />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-white/10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // simple
  return (
    <footer className="bg-white border-t border-gray-100 py-8 px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <LogoPh text={props.logo} />
        <div className="flex gap-6">
          {[...Array(5)].map((_, i) => <Ph key={i} w="w-12" h="h-2.5" />)}
        </div>
        <Tx
          value={props.copyright}
          fieldKey="copyright"
          placeholder="© 2025 Bedrijfsnaam. Alle rechten voorbehouden."
          editing={editing}
          onPropChange={onPropChange}
          className="text-xs text-gray-400"
          barWidth="w-40"
        />
      </div>
    </footer>
  )
}
