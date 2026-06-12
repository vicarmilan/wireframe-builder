import { WireframeProps, Ph, ImgPh, AvatarPh, Section, Tx } from './shared'

export default function BlogWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'featured') {
    return (
      <Section>
        <Tx value={props.title} fieldKey="title" placeholder="Laatste artikelen" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900 mb-8" barWidth="w-40" />
        <div className="flex gap-6">
          {/* Featured large */}
          <div className="flex-[1.5] space-y-4">
            <ImgPh aspect="aspect-video" />
            <div className="inline-block bg-blue-50 text-blue-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Uitgelicht</div>
            <div className="space-y-1">
              <Tx value={props.a1_title} fieldKey="a1_title" placeholder="Uitgelicht artikel: hoe wij werken" editing={editing} onPropChange={onPropChange} className="text-xl font-bold text-gray-900" barWidth="w-full" multiline={true} />
            </div>
            <div className="space-y-1.5">
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-3/4" h="h-2.5" />
            </div>
            <div className="flex items-center gap-2">
              <AvatarPh size="w-6 h-6" />
              <Ph w="w-20" h="h-2" />
              <Ph w="w-12" h="h-2" className="ml-auto" />
            </div>
          </div>
          {/* Secondary list */}
          <div className="flex-1 space-y-5">
            {[
              { tk: 'a2_title', tph: 'Tweede artikel titel hier' },
              { tk: 'a3_title', tph: 'Derde artikel titel hier' },
              { tk: 'a4_title', tph: 'Vierde artikel titel hier' },
            ].map(({ tk, tph }, i) => (
              <div key={i}>
                {i > 0 && <div className="border-t border-gray-100 mb-5" />}
                <div className="flex gap-3">
                  <ImgPh aspect="aspect-square" className="w-20 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="inline-block bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded">Categorie</div>
                    <Tx value={props[tk]} fieldKey={tk} placeholder={tph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-sm leading-snug" barWidth="w-full" />
                    <div className="space-y-1">
                      <Ph w="w-full" h="h-2" />
                      <Ph w="w-4/5" h="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    )
  }

  const articles = [
    { titleKey: 'a1_title', dateKey: 'a1_date', titlePh: 'Hoe je een website bouwt', datePh: '12 juni 2025' },
    { titleKey: 'a2_title', dateKey: 'a2_date', titlePh: 'Tips voor betere UX', datePh: '5 juni 2025' },
    { titleKey: 'a3_title', dateKey: 'a3_date', titlePh: 'Design trends 2025', datePh: '1 juni 2025' },
  ]

  return (
    <Section>
      <div className="flex items-center justify-between mb-10">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Laatste artikelen"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-40"
        />
        <Ph w="w-24" h="h-8" className="rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {articles.map(({ titleKey, dateKey, titlePh, datePh }, i) => (
          <div key={i} className="space-y-3">
            <ImgPh aspect="aspect-video" />
            <div className="space-y-2">
              <Ph w="w-16" h="h-2.5" />
              <Tx
                value={props[titleKey]}
                fieldKey={titleKey}
                placeholder={titlePh}
                editing={editing}
                onPropChange={onPropChange}
                className="font-semibold text-gray-900 text-sm"
                barWidth="w-full"
              />
              <div className="space-y-1.5">
                <Ph h="h-2.5" />
                <Ph w="w-5/6" h="h-2.5" />
              </div>
              <Tx
                value={props[dateKey]}
                fieldKey={dateKey}
                placeholder={datePh}
                editing={editing}
                onPropChange={onPropChange}
                className="text-xs text-gray-400"
                barWidth="w-20"
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
