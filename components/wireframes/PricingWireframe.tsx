import { WireframeProps, Ph, BtnPh, Section, Tx } from './shared'

export default function PricingWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const plans = [
    { nameKey: 'p1_name', priceKey: 'p1_price', namePh: 'Starter', pricePh: '€29/maand', featured: false },
    { nameKey: 'p2_name', priceKey: 'p2_price', namePh: 'Pro', pricePh: '€79/maand', featured: true },
    { nameKey: 'p3_name', priceKey: 'p3_price', namePh: 'Enterprise', pricePh: 'Op aanvraag', featured: false },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Eenvoudige prijzen"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-48"
        />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {plans.map(({ nameKey, priceKey, namePh, pricePh, featured }, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 space-y-4 ${featured ? 'bg-[#2563EB] text-white' : 'bg-gray-50'}`}
          >
            <Tx
              value={props[nameKey]}
              fieldKey={nameKey}
              placeholder={namePh}
              editing={editing}
              onPropChange={onPropChange}
              className={`font-semibold ${featured ? 'text-white/80' : 'text-gray-500'} text-sm uppercase tracking-wide`}
              barWidth="w-16"
            />
            <Tx
              value={props[priceKey]}
              fieldKey={priceKey}
              placeholder={pricePh}
              editing={editing}
              onPropChange={onPropChange}
              className={`text-3xl font-black ${featured ? 'text-white' : 'text-gray-900'}`}
              barWidth="w-24"
            />
            <div className="space-y-2 py-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${featured ? 'bg-white/40' : 'bg-blue-100'}`} />
                  <Ph w="w-full" h="h-2.5" className={featured ? 'bg-white/30' : ''} />
                </div>
              ))}
            </div>
            <BtnPh
              text={props[`p${i + 1}_cta`] || (featured ? 'Aan de slag' : 'Selecteren')}
              className={featured ? 'bg-white text-[#2563EB] w-full justify-center' : 'w-full justify-center'}
              editing={editing}
              fieldKey={`p${i + 1}_cta`}
              onPropChange={onPropChange}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
