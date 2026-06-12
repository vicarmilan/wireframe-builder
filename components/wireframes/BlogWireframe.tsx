import { WireframeProps, Ph, ImgPh, Section, Tx } from './shared'

export default function BlogWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
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
