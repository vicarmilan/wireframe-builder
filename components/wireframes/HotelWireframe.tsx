import { WireframeProps, Ph, ImgPh, IconPh, BtnPh, Section, Tx } from './shared'

export default function HotelWireframe({ props, variant, editing, onPropChange }: WireframeProps) {

  // Room cards
  if (variant === 'rooms') {
    return (
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <Tx value={props.title} fieldKey="title" placeholder="Onze kamers" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-40" />
            <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Comfortabel verblijf voor elk budget." editing={editing} onPropChange={onPropChange} className="text-gray-500 text-sm" barWidth="w-60" />
          </div>
          <div className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-lg">Alle kamers</div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { pk: 'r1_price', nk: 'r1_name', bk: 'r1_badge', pph: '€120', nph: 'Standaard kamer', bph: 'Beschikbaar', featured: false },
            { pk: 'r2_price', nk: 'r2_name', bk: 'r2_badge', pph: '€220', nph: 'Suite', bph: 'Suite', featured: true },
            { pk: 'r3_price', nk: 'r3_name', bk: 'r3_badge', pph: '€85', nph: 'Budget kamer', bph: 'Beperkt', featured: false },
          ].map(({ pk, nk, bk, pph, nph, bph, featured }, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <ImgPh aspect="aspect-video" className={`rounded-none ${featured ? 'brightness-90' : ''}`} />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-sm" barWidth="w-28" />
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${featured ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Tx value={props[bk]} fieldKey={bk} placeholder={bph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-12" />
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <IconPh size="w-3.5 h-3.5" />
                      <Ph w="w-10" h="h-2" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className="text-xl font-black text-[#2563EB]" barWidth="w-12" />
                    <Ph w="w-10" h="h-2" />
                  </div>
                  <BtnPh text={props[`r${i + 1}_cta`] || 'Boek'} editing={editing} fieldKey={`r${i + 1}_cta`} onPropChange={onPropChange} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // Amenities grid
  if (variant === 'amenities') {
    return (
      <Section>
        <div className="text-center mb-10 space-y-2">
          <Tx value={props.title} fieldKey="title" placeholder="Onze faciliteiten" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-48" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Alles voor een zorgeloos verblijf." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-48" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <IconPh size="w-12 h-12 mx-auto" />
              <Ph w="w-20" h="h-2.5" className="mx-auto" />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // Packages / offers
  return (
    <Section>
      <div className="text-center mb-8">
        <Tx value={props.title} fieldKey="title" placeholder="Speciale arrangementen" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-56" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[
          { nk: 'p1_name', pk: 'p1_price', bk: 'p1_badge', nph: 'Weekendarrangement', pph: '€199', bph: 'Weekend Deal', bg: 'bg-blue-50' },
          { nk: 'p2_name', pk: 'p2_price', bk: 'p2_badge', nph: 'Romantisch pakket', pph: '€349', bph: 'Honeymoon', bg: 'bg-gray-50' },
        ].map(({ nk, pk, bk, nph, pph, bph, bg }, i) => (
          <div key={i} className={`${bg} rounded-xl overflow-hidden flex`}>
            <ImgPh aspect="aspect-auto" className="w-28 flex-shrink-0 rounded-none" />
            <div className="flex-1 flex flex-col justify-center gap-3 p-5">
              <span className="self-start text-[10px] font-semibold bg-[#2563EB] text-white px-2 py-0.5 rounded-full">
                <Tx value={props[bk]} fieldKey={bk} placeholder={bph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-16" />
              </span>
              <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="font-bold text-gray-900" barWidth="w-36" />
              <div className="space-y-1">
                <Ph w="w-full" h="h-2.5" />
                <Ph w="w-4/5" h="h-2.5" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <Tx value={props[pk]} fieldKey={pk} placeholder={pph} editing={editing} onPropChange={onPropChange} className="text-xl font-black text-[#2563EB]" barWidth="w-16" />
                  <span className="text-xs text-gray-400">/nacht</span>
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
