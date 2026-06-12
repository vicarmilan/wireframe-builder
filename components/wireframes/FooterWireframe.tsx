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

  if (variant === 'cta-footer') {
    return (
      <footer>
        {/* Pre-footer CTA */}
        <div className="bg-[#2563EB] px-8 py-8 flex items-center justify-between">
          <div className="space-y-1.5">
            <Tx value={props.cta_title} fieldKey="cta_title" placeholder="Klaar om te starten?" editing={editing} onPropChange={onPropChange} className="text-white font-bold text-xl" barWidth="w-72" />
            <Tx value={props.cta_subtitle} fieldKey="cta_subtitle" placeholder="Neem vandaag nog contact op." editing={editing} onPropChange={onPropChange} className="text-white/70 text-sm" barWidth="w-48" />
          </div>
          <div className="bg-white text-[#2563EB] font-semibold text-sm px-5 py-2.5 rounded-lg flex-shrink-0">
            <Tx value={props.cta_primary} fieldKey="cta_primary" placeholder="Begin vandaag" editing={editing} onPropChange={onPropChange} className="" barWidth="w-20" />
          </div>
        </div>
        {/* Footer body */}
        <div className="bg-gray-900 px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#2563EB] rounded" />
                  <div className="h-3 bg-white/80 rounded w-20" />
                </div>
                <div className="space-y-1.5">
                  <Ph w="w-full" h="h-2" className="bg-white/20" />
                  <Ph w="w-4/5" h="h-2" className="bg-white/20" />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="w-6 h-6 bg-white/10 rounded-full" />)}
                </div>
              </div>
              {[...Array(2)].map((_, col) => (
                <div key={col} className="space-y-3">
                  <Ph w="w-16" h="h-3" className="bg-white/50" />
                  {[...Array(3)].map((_, i) => <Ph key={i} w="w-24" h="h-2.5" className="bg-white/20" />)}
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-5 flex items-center justify-between">
              <Tx value={props.copyright} fieldKey="copyright" placeholder="© 2025 Bedrijfsnaam." editing={editing} onPropChange={onPropChange} className="text-gray-400 text-xs" barWidth="w-48" />
              <div className="flex gap-4">
                <Ph w="w-14" h="h-2" className="bg-white/15" />
                <Ph w="w-16" h="h-2" className="bg-white/15" />
              </div>
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
