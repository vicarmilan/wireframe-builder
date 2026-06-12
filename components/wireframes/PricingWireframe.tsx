import { WireframeProps, Ph, ImgPh, BtnPh, Section, Tx } from './shared'

export default function PricingWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'table') {
    return (
      <Section>
        <div className="text-center mb-8">
          <Tx value={props.title} fieldKey="title" placeholder="Vergelijk onze plannen" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-56" />
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
          {/* Header row */}
          <div className="grid bg-gray-50 border-b border-gray-200" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}>
            <div className="p-5" />
            {[
              { nk: 'p1_name', pk: 'p1_price', nph: 'Starter', pph: '€29/maand', featured: false },
              { nk: 'p2_name', pk: 'p2_price', nph: 'Pro', pph: '€79/maand', featured: true },
              { nk: 'p3_name', pk: 'p3_price', nph: 'Enterprise', pph: 'Op aanvraag', featured: false },
            ].map(({ nk, pk, nph, pph, featured }, i) => (
              <div key={i} className={`p-3 text-center ${featured ? 'bg-blue-50' : ''}`}>
                <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="text-xs font-semibold text-gray-500 uppercase tracking-wide" barWidth="w-12" />
                <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className="text-base font-black text-gray-900 mt-1" barWidth="w-16" />
              </div>
            ))}
          </div>
          {/* Feature rows */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid border-b border-gray-100 last:border-0" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}>
              <div className="px-5 py-3"><Ph w="w-36" h="h-2.5" /></div>
              {[false, true, true].map((has, col) => (
                <div key={col} className={`flex items-center justify-center py-3 ${col === 1 ? 'bg-blue-50' : ''}`}>
                  {has || row < 2 ? (
                    <div className="w-4 h-4 rounded-full bg-[#2563EB]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>
    )
  }

  if (variant === 'packages') {
    return (
      <Section>
        <div className="text-center mb-10 space-y-2">
          <Tx value={props.title} fieldKey="title" placeholder="Onze diensten" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-48" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Kies het pakket dat bij jou past." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-48" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { nk: 'p1_name', pk: 'p1_price', nph: 'Basis', pph: '€45' },
            { nk: 'p2_name', pk: 'p2_price', nph: 'Standaard', pph: '€95' },
            { nk: 'p3_name', pk: 'p3_price', nph: 'Premium', pph: '€149' },
          ].map(({ nk, pk, nph, pph }, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <ImgPh aspect="aspect-video" className="rounded-none" />
              <div className="p-5 space-y-3">
                <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900" barWidth="w-24" />
                <div className="space-y-1">
                  <Ph w="w-full" h="h-2.5" />
                  <Ph w="w-4/5" h="h-2.5" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs text-gray-400">€</span>
                    <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className="text-2xl font-black text-gray-900" barWidth="w-12" />
                  </div>
                  <BtnPh text="Boek" editing={editing} fieldKey={`p${i + 1}_cta`} onPropChange={onPropChange} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

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
