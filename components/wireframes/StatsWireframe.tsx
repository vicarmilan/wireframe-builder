import { WireframeProps, Ph, IconPh, Section, Tx } from './shared'

export default function StatsWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const stats = [
    { numKey: 's1_num', labelKey: 's1_label', numPh: '10.000+', labelPh: 'Klanten' },
    { numKey: 's2_num', labelKey: 's2_label', numPh: '99%', labelPh: 'Tevredenheid' },
    { numKey: 's3_num', labelKey: 's3_label', numPh: '50+', labelPh: 'Landen' },
    { numKey: 's4_num', labelKey: 's4_label', numPh: '24/7', labelPh: 'Support' },
  ]

  if (variant === 'icons') {
    return (
      <Section>
        <div className="grid grid-cols-4 gap-8 text-center">
          {stats.map(({ numKey, labelKey, numPh, labelPh }, i) => (
            <div key={i} className="space-y-3">
              <IconPh size="w-10 h-10 mx-auto" />
              <Tx value={props[numKey]} fieldKey={numKey} placeholder={numPh} editing={editing} onPropChange={onPropChange} className="text-3xl font-black text-[#2563EB]" barWidth="w-20" />
              <Tx value={props[labelKey]} fieldKey={labelKey} placeholder={labelPh} editing={editing} onPropChange={onPropChange} className="text-sm text-gray-500" barWidth="w-16" />
              <div className="space-y-1">
                <Ph w="w-full" h="h-2" />
                <Ph w="w-4/5" h="h-2" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

  if (variant === 'dark') {
    return (
      <section className="bg-gray-900 py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 text-center">
          {stats.map(({ numKey, labelKey, numPh, labelPh }, i) => (
            <div key={i} className="space-y-2">
              <Tx value={props[numKey]} fieldKey={numKey} placeholder={numPh} editing={editing} onPropChange={onPropChange} className="text-4xl font-black text-[#2563EB]" barWidth="w-20" />
              <Tx value={props[labelKey]} fieldKey={labelKey} placeholder={labelPh} editing={editing} onPropChange={onPropChange} className="text-sm text-white/60" barWidth="w-16" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (variant === 'progress') {
    return (
      <Section>
        <div className="text-center mb-10">
          <Tx value={props.title} fieldKey="title" placeholder="Onze resultaten" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-40" />
        </div>
        <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
          {stats.map(({ numKey, labelKey, numPh, labelPh }, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between">
                <Tx value={props[labelKey]} fieldKey={labelKey} placeholder={labelPh} editing={editing} onPropChange={onPropChange} className="text-sm font-medium text-gray-700" barWidth="w-20" />
                <Tx value={props[numKey]} fieldKey={numKey} placeholder={numPh} editing={editing} onPropChange={onPropChange} className="text-sm font-bold text-[#2563EB]" barWidth="w-12" />
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${[85, 99, 72, 95][i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // default: row of 4
  return (
    <Section>
      <div className="grid grid-cols-4 gap-8 text-center">
        {stats.map(({ numKey, labelKey, numPh, labelPh }, i) => (
          <div key={i} className="space-y-2">
            <Tx
              value={props[numKey]}
              fieldKey={numKey}
              placeholder={numPh}
              editing={editing}
              onPropChange={onPropChange}
              className="text-4xl font-black text-[#2563EB]"
              barWidth="w-20"
            />
            <Tx
              value={props[labelKey]}
              fieldKey={labelKey}
              placeholder={labelPh}
              editing={editing}
              onPropChange={onPropChange}
              className="text-sm text-gray-500"
              barWidth="w-16"
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
