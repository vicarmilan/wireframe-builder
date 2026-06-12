import { WireframeProps, Ph, ImgPh, Section, Tx } from './shared'

export default function PortfolioWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const projects = [
    { titleKey: 'p1_title', catKey: 'p1_cat', titlePh: 'Project naam', catPh: 'Webdesign' },
    { titleKey: 'p2_title', catKey: 'p2_cat', titlePh: 'Project naam', catPh: 'Branding' },
    { titleKey: 'p3_title', catKey: 'p3_cat', titlePh: 'Project naam', catPh: 'Development' },
  ]

  return (
    <Section>
      <div className="flex items-center justify-between mb-10">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Ons werk"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-32"
        />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Ph key={i} w="w-16" h="h-7" className="rounded-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {projects.map(({ titleKey, catKey, titlePh, catPh }, i) => (
          <div key={i} className="group cursor-pointer">
            <ImgPh aspect="aspect-[4/3]" className="mb-3" />
            <div className="space-y-1">
              <Tx
                value={props[catKey]}
                fieldKey={catKey}
                placeholder={catPh}
                editing={editing}
                onPropChange={onPropChange}
                className="text-xs text-[#2563EB] font-medium"
                barWidth="w-16"
              />
              <Tx
                value={props[titleKey]}
                fieldKey={titleKey}
                placeholder={titlePh}
                editing={editing}
                onPropChange={onPropChange}
                className="font-semibold text-gray-900"
                barWidth="w-32"
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
