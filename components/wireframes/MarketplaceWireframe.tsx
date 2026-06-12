import { WireframeProps, Ph, ImgPh, Stars, IconPh, BtnPh, Section, Tx } from './shared'

export default function MarketplaceWireframe({ props, variant, editing, onPropChange }: WireframeProps) {

  // Listing cards grid
  if (variant === 'listings') {
    return (
      <Section>
        <div className="flex items-center justify-between mb-6">
          <Ph w="w-40" h="h-3.5" />
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 w-40">
              <Ph w="w-4" h="h-4" className="rounded-full flex-shrink-0" />
              <Ph w="w-24" h="h-2.5" />
            </div>
            <div className="border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-lg">Filter</div>
            <div className="border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-lg">Sorteren</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { pk: 'l1_price', pph: '€4.500', t1k: 'l1_tag1', t1ph: '2019', t2k: 'l1_tag2', t2ph: '45.000 km', t3k: 'l1_tag3', t3ph: 'Diesel', bk: 'l1_badge', bph: 'Uitgelicht', featured: false },
            { pk: 'l2_price', pph: '€12.900', t1k: 'l2_tag1', t1ph: '2021', t2k: 'l2_tag2', t2ph: '18.000 km', t3k: 'l2_tag3', t3ph: 'Elektrisch', bk: 'l2_badge', bph: 'Uitgelicht', featured: true },
            { pk: 'l3_price', pph: '€7.200', t1k: 'l3_tag1', t1ph: '2017', t2k: 'l3_tag2', t2ph: '82.000 km', t3k: 'l3_tag3', t3ph: 'Benzine', bk: 'l3_badge', bph: 'Uitgelicht', featured: false },
          ].map(({ pk, pph, t1k, t1ph, t2k, t2ph, t3k, t3ph, bk, bph, featured }, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="relative">
                <ImgPh aspect="aspect-video" className="rounded-none" />
                {featured && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#2563EB] text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                      <Tx value={props[bk]} fieldKey={bk} placeholder={bph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-12" />
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full" />
              </div>
              <div className="p-4 space-y-2.5">
                <Ph w="w-40" h="h-3" />
                <div className="flex items-center gap-1.5">
                  <Ph w="w-4" h="h-4" className="rounded-full" />
                  <Ph w="w-20" h="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className={`text-lg font-black ${featured ? 'text-[#2563EB]' : 'text-gray-900'}`} barWidth="w-16" />
                  <Stars />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ k: t1k, ph: t1ph }, { k: t2k, ph: t2ph }, { k: t3k, ph: t3ph }].map(({ k, ph }, j) => (
                    <span key={j} className="bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded">
                      <Tx value={props[k]} fieldKey={k} placeholder={ph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-10" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {[null, '1', null, null, null, null].map((n, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${n === '1' ? 'bg-[#2563EB]' : 'border border-gray-200'}`}>
              {n === '1' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // Search with sidebar filters
  if (variant === 'search-filters') {
    return (
      <div className="overflow-hidden rounded-xl flex bg-white" style={{ minHeight: 400 }}>
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 p-5 space-y-5">
          <Ph w="w-16" h="h-3.5" />
          {/* Filter group */}
          <div className="space-y-2.5">
            <Ph w="w-20" h="h-2.5" />
            <div className="space-y-2">
              {[80, 70, 90, 75].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 border rounded flex-shrink-0 ${i === 1 ? 'bg-[#2563EB] border-[#2563EB]' : 'border-gray-300'}`} />
                  <Ph w={`w-${Math.round(w / 4)}`} h="h-2.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2.5">
            <Ph w="w-16" h="h-2.5" />
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563EB] rounded-full w-3/4" />
            </div>
            <div className="flex justify-between">
              <Ph w="w-10" h="h-2" />
              <Ph w="w-12" h="h-2" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2.5">
            <Ph w="w-14" h="h-2.5" />
            <div className="space-y-2">
              {[60, 70, 65].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 border rounded flex-shrink-0 ${i === 2 ? 'bg-[#2563EB] border-[#2563EB]' : 'border-gray-300'}`} />
                  <Ph w={`w-${Math.round(w / 4)}`} h="h-2.5" />
                </div>
              ))}
            </div>
          </div>
          <BtnPh text="Filter toepassen" editing={editing} fieldKey="cta" onPropChange={onPropChange} className="w-full justify-center text-xs" />
        </div>
        {/* Results */}
        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Ph w="w-32" h="h-2.5" />
            <div className="border border-gray-200 rounded-lg px-3 py-2 w-36">
              <Ph w="w-24" h="h-2.5" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { pk: 'r1_price', pph: '€8.500' },
              { pk: 'r2_price', pph: '€14.200' },
              { pk: 'r3_price', pph: '€5.900' },
            ].map(({ pk, pph }, i) => (
              <div key={i} className="flex gap-3 items-start border border-gray-100 rounded-xl p-3">
                <ImgPh aspect="aspect-video" className="w-24 flex-shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Ph w="w-44" h="h-3" />
                  <div className="flex gap-1.5">
                    {[...Array(i < 2 ? 3 : 2)].map((_, j) => (
                      <span key={j} className="bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded"><Ph w="w-6" h="h-2" /></span>
                    ))}
                  </div>
                  <Ph w="w-48" h="h-2.5" />
                </div>
                <div className="flex-shrink-0 text-right space-y-2">
                  <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className="text-xl font-black text-[#2563EB]" barWidth="w-16" />
                  <BtnPh text={props[`r${i + 1}_cta`] || 'Bekijken'} editing={editing} fieldKey={`r${i + 1}_cta`} onPropChange={onPropChange} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Category grid
  if (variant === 'categories') {
    return (
      <Section>
        <div className="text-center mb-8 space-y-2">
          <Tx value={props.title} fieldKey="title" placeholder="Blader per categorie" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-56" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Vind wat je zoekt." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-40" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { bg: 'bg-blue-50', active: true },
            ...Array(7).fill({ bg: 'bg-gray-50', active: false }),
          ].map(({ bg, active }, i) => (
            <div key={i} className={`${bg} rounded-xl p-5 flex flex-col items-center gap-2.5 text-center`}>
              <IconPh size={`w-10 h-10 ${active ? '' : ''}`} />
              <Ph w="w-16" h="h-3" />
              <Ph w="w-12" h="h-2" />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // Seller / buyer dual CTA
  return (
    <div className="overflow-hidden rounded-xl flex" style={{ minHeight: 240 }}>
      <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10 bg-blue-50">
        <IconPh size="w-12 h-12" />
        <div className="space-y-2">
          <Tx value={props.sell_title} fieldKey="sell_title" placeholder="Verkopen" editing={editing} onPropChange={onPropChange} className="text-xl font-bold text-gray-900" barWidth="w-32" />
          <div className="space-y-1.5">
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-3/4" h="h-2.5" />
          </div>
        </div>
        <BtnPh text={props.sell_cta || 'Advertentie plaatsen'} editing={editing} fieldKey="sell_cta" onPropChange={onPropChange} />
      </div>
      <div className="w-px bg-gray-200" />
      <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10">
        <IconPh size="w-12 h-12" />
        <div className="space-y-2">
          <Tx value={props.buy_title} fieldKey="buy_title" placeholder="Kopen" editing={editing} onPropChange={onPropChange} className="text-xl font-bold text-gray-900" barWidth="w-24" />
          <div className="space-y-1.5">
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-3/4" h="h-2.5" />
          </div>
        </div>
        <BtnPh text={props.buy_cta || 'Advertenties bekijken'} editing={editing} fieldKey="buy_cta" onPropChange={onPropChange} />
      </div>
    </div>
  )
}
