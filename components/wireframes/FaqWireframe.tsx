import { WireframeProps, Ph, Section, Tx } from './shared'

export default function FaqWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const faqs = [
    { qKey: 'q1', aKey: 'a1', qPh: 'Hoe werkt het?', aPh: 'Het werkt eenvoudig door...' },
    { qKey: 'q2', aKey: 'a2', qPh: 'Wat zijn de kosten?', aPh: 'De kosten zijn afhankelijk van...' },
    { qKey: 'q3', aKey: 'a3', qPh: 'Kan ik gratis proberen?', aPh: 'Ja, je kan 14 dagen gratis proberen.' },
    { qKey: undefined, aKey: undefined, qPh: '', aPh: '' },
    { qKey: undefined, aKey: undefined, qPh: '', aPh: '' },
  ]

  if (variant === 'two-column') {
    return (
      <Section>
        <div className="flex gap-16">
          <div className="w-60 flex-shrink-0 space-y-5">
            <div className="space-y-2">
              <Tx value={props.title} fieldKey="title" placeholder="Veelgestelde vragen" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-full" multiline={true} />
            </div>
            <div className="space-y-1.5">
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-3/4" h="h-2.5" />
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Ph w="w-full" h="h-2.5" />
              <div className="inline-flex items-center justify-center bg-[#2563EB] text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                Contact support
              </div>
            </div>
          </div>
          <div className="flex-1 divide-y divide-gray-100">
            {[props.q1 || 'Hoe werkt het?', props.q2 || 'Wat zijn de kosten?', props.q3 || 'Kan ik gratis proberen?', 'Hoelang duurt de setup?', 'Hoe annuleer ik?'].map((q, i) => (
              <div key={i} className="flex items-center justify-between py-4 gap-4">
                <div className="text-sm font-medium text-gray-900">{q}</div>
                <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Veelgestelde vragen"
            editing={editing}
            onPropChange={onPropChange}
            className="text-3xl font-bold text-gray-900"
            barWidth="w-56"
          />
        </div>
        <div className="space-y-3">
          {faqs.map(({ qKey, aKey, qPh, aPh }, i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                {qKey ? (
                  <Tx
                    value={props[qKey]}
                    fieldKey={qKey}
                    placeholder={qPh}
                    editing={editing}
                    onPropChange={onPropChange}
                    className="font-medium text-gray-900 text-sm"
                    barWidth="w-64"
                  />
                ) : <Ph w="w-64" h="h-3" />}
                <div className="w-5 h-5 bg-[#C8CFD8] rounded flex-shrink-0 ml-4" />
              </div>
              {aKey && i === 0 && (
                <div className="px-5 pb-4">
                  <Tx
                    value={props[aKey]}
                    fieldKey={aKey}
                    placeholder={aPh}
                    editing={editing}
                    onPropChange={onPropChange}
                    className="text-sm text-gray-500"
                    barWidth="w-full"
                    multiline={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
