import { WireframeProps, Section, Tx } from './shared'

export default function StatsWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const stats = [
    { numKey: 's1_num', labelKey: 's1_label', numPh: '10.000+', labelPh: 'Klanten' },
    { numKey: 's2_num', labelKey: 's2_label', numPh: '99%', labelPh: 'Tevredenheid' },
    { numKey: 's3_num', labelKey: 's3_label', numPh: '50+', labelPh: 'Landen' },
    { numKey: 's4_num', labelKey: 's4_label', numPh: '24/7', labelPh: 'Support' },
  ]

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
