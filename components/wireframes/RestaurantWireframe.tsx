import { WireframeProps, Ph, ImgPh, AvatarPh, Stars, IconPh, BtnPh, Section, Tx } from './shared'

export default function RestaurantWireframe({ props, variant, editing, onPropChange }: WireframeProps) {

  // Menu with categories + items
  if (variant === 'menu') {
    return (
      <Section>
        <div className="text-center space-y-2 mb-8">
          <Tx value={props.title} fieldKey="title" placeholder="Onze menukaart" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-48" multiline={true} />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Verse ingrediënten, elke dag bereid." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-48" />
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {[
            { key: 'cat1_label', ph: 'Starters' },
            { key: 'cat2_label', ph: 'Mains' },
            { key: 'cat3_label', ph: 'Desserts' },
            { key: 'cat4_label', ph: 'Dranken' },
            { key: 'cat5_label', ph: 'Wijnen' },
          ].map(({ key, ph }, i) => (
            <div key={i} className={`text-xs font-medium px-4 py-1.5 rounded-full ${i === 0 ? 'bg-[#2563EB] text-white' : 'border border-gray-200 text-gray-500'}`}>
              <Tx value={props[key]} fieldKey={key} placeholder={ph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-12" />
            </div>
          ))}
        </div>
        {/* Menu items */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { priceKey: 'item1_price', pricePh: '€14', tag1Key: 'item1_tag1', tag1Ph: 'Vegan', tag2Key: 'item1_tag2', tag2Ph: 'GF', hasTags: true },
            { priceKey: 'item2_price', pricePh: '€18', tag1Key: null, tag1Ph: '', tag2Key: null, tag2Ph: '', hasTags: false },
            { priceKey: 'item3_price', pricePh: '€12', tag1Key: 'item3_tag1', tag1Ph: 'Popular', tag2Key: null, tag2Ph: '', hasTags: true },
            { priceKey: 'item4_price', pricePh: '€22', tag1Key: null, tag1Ph: '', tag2Key: null, tag2Ph: '', hasTags: false },
          ].map(({ priceKey, pricePh, tag1Key, tag1Ph, tag2Key, tag2Ph, hasTags }, i) => (
            <div key={i} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 items-start">
              <ImgPh aspect="aspect-square" className="w-16 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Ph w="w-32" h="h-3" />
                  <Tx value={props[priceKey]} fieldKey={priceKey} placeholder={pricePh} editing={editing} onPropChange={onPropChange} className="font-bold text-sm text-gray-900 flex-shrink-0" barWidth="w-8" />
                </div>
                <Ph w="w-full" h="h-2" />
                <Ph w="w-4/5" h="h-2" />
                {hasTags && (
                  <div className="flex gap-1.5 pt-0.5">
                    {tag1Key && <span className="bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded"><Tx value={props[tag1Key]} fieldKey={tag1Key} placeholder={tag1Ph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-8" /></span>}
                    {tag2Key && <span className="bg-gray-100 text-gray-500 text-[9px] font-medium px-1.5 py-0.5 rounded"><Tx value={props[tag2Key]} fieldKey={tag2Key} placeholder={tag2Ph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-6" /></span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <BtnPh text={props.cta || 'Volledig menu'} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
        </div>
      </Section>
    )
  }

  // Chef's specials
  if (variant === 'specials') {
    return (
      <div className="overflow-hidden rounded-xl flex" style={{ minHeight: 280 }}>
        <ImgPh aspect="aspect-auto" className="flex-1 rounded-none" />
        <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10 bg-amber-50">
          <div className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-medium px-3 py-1 rounded-full self-start">
            <Tx value={props.badge} fieldKey="badge" placeholder="Dagschotel" editing={editing} onPropChange={onPropChange} className="" barWidth="w-16" />
          </div>
          <div className="space-y-1">
            <Tx value={props.title} fieldKey="title" placeholder="Chef's aanbeveling" editing={editing} onPropChange={onPropChange} className="text-2xl font-bold text-gray-900" barWidth="w-48" multiline={true} />
            <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Speciaal bereid door onze chef." editing={editing} onPropChange={onPropChange} className="text-gray-600 text-sm" barWidth="w-40" />
          </div>
          <div className="space-y-1.5">
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-3/4" h="h-2.5" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: 'ing1', ph: 'Ingredient 1' },
              { key: 'ing2', ph: 'Ingredient 2' },
              { key: 'ing3', ph: 'Ingredient 3' },
            ].map(({ key, ph }, i) => (
              <span key={i} className="border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded">
                <Tx value={props[key]} fieldKey={key} placeholder={ph} editing={editing} onPropChange={onPropChange} className="" barWidth="w-16" />
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Tx value={props.price} fieldKey="price" placeholder="€28" editing={editing} onPropChange={onPropChange} className="text-3xl font-black text-gray-900" barWidth="w-12" />
            <BtnPh text={props.cta || 'Bestellen'} editing={editing} fieldKey="cta" onPropChange={onPropChange} />
          </div>
        </div>
      </div>
    )
  }

  // Reservation form
  if (variant === 'reservation') {
    return (
      <Section>
        <div className="text-center space-y-2 mb-8">
          <Tx value={props.title} fieldKey="title" placeholder="Reserveer een tafel" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-56" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Boek eenvoudig online." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-40" />
        </div>
        <div className="max-w-lg mx-auto border border-gray-100 rounded-2xl p-7 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {['Naam', 'Telefoonnummer', 'Datum', 'Tijdstip', 'Aantal personen'].map((label, i) => (
              <div key={i} className={`space-y-1.5 ${i === 4 ? 'col-span-2' : ''}`}>
                <div className="text-xs font-medium text-gray-600">{label}</div>
                <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 flex items-center px-3 gap-2">
                  <Ph w="w-4" h="h-4" className="rounded-full flex-shrink-0" />
                  <Ph w="w-24" h="h-2.5" />
                </div>
              </div>
            ))}
            <div className="col-span-2 space-y-1.5">
              <div className="text-xs font-medium text-gray-600">Opmerking</div>
              <div className="h-16 bg-gray-50 rounded-lg border border-gray-200" />
            </div>
          </div>
          <BtnPh text={props.cta || 'Tafel reserveren'} editing={editing} fieldKey="cta" onPropChange={onPropChange} className="w-full justify-center" />
        </div>
      </Section>
    )
  }

  // Opening hours + location
  if (variant === 'hours') {
    return (
      <div className="overflow-hidden rounded-xl flex" style={{ minHeight: 280 }}>
        <div className="flex-1 flex flex-col justify-center gap-8 px-10 py-10">
          <div className="space-y-3">
            <Tx value={props.hours_title} fieldKey="hours_title" placeholder="Openingsuren" editing={editing} onPropChange={onPropChange} className="text-2xl font-bold text-gray-900" barWidth="w-44" />
            <div className="space-y-0">
              {[
                { labelKey: 'day1_label', labelPh: 'Maandag – vrijdag', closed: false },
                { labelKey: 'day2_label', labelPh: 'Zaterdag', closed: false },
                { labelKey: 'day3_label', labelPh: 'Zondag', closed: true },
              ].map(({ labelKey, labelPh, closed }, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <Tx value={props[labelKey]} fieldKey={labelKey} placeholder={labelPh} editing={editing} onPropChange={onPropChange} className="text-sm text-gray-700" barWidth="w-32" />
                  {!closed ? <Ph w="w-24" h="h-2.5" /> : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      <Tx value={props.day3_status} fieldKey="day3_status" placeholder="Gesloten" editing={editing} onPropChange={onPropChange} className="" barWidth="w-12" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Tx value={props.address_title} fieldKey="address_title" placeholder="Adres" editing={editing} onPropChange={onPropChange} className="text-2xl font-bold text-gray-900" barWidth="w-28" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconPh size="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <Tx value={props.address} fieldKey="address" placeholder="Kerkstraat 12, Gent" editing={editing} onPropChange={onPropChange} className="text-sm text-gray-600" barWidth="w-40" />
              </div>
            </div>
          </div>
        </div>
        {/* Map placeholder */}
        <div className="flex-1 bg-gray-200 relative rounded-r-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm font-medium">Kaart</div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-5 h-5 bg-[#2563EB] rounded-full border-2 border-white shadow-md" />
          </div>
        </div>
      </div>
    )
  }

  // Reviews
  if (variant === 'reviews') {
    return (
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <span className="text-6xl font-black text-gray-900 leading-none">4.8</span>
            <div className="space-y-1.5">
              <Stars />
              <Ph w="w-24" h="h-2.5" />
              <div className="flex items-center gap-2">
                <Ph w="w-12" h="h-4" className="rounded" />
                <Ph w="w-16" h="h-2" />
              </div>
            </div>
          </div>
          <div className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg">Review schrijven</div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AvatarPh size="w-8 h-8" />
                  <Ph w="w-20" h="h-2.5" />
                </div>
                <Stars />
              </div>
              <div className="space-y-1.5">
                <Ph w="w-full" h="h-2.5" />
                <Ph w="w-full" h="h-2.5" />
                <Ph w="w-4/5" h="h-2.5" />
              </div>
              <Ph w="w-16" h="h-2" className="opacity-50" />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  // Delivery / takeaway
  if (variant === 'delivery') {
    return (
      <div className="overflow-hidden rounded-xl flex">
        <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10 bg-blue-50">
          <IconPh size="w-12 h-12" />
          <div className="space-y-2">
            <Tx value={props.d1_title} fieldKey="d1_title" placeholder="Online bestellen" editing={editing} onPropChange={onPropChange} className="text-xl font-bold text-gray-900" barWidth="w-36" />
            <div className="space-y-1.5">
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-3/4" h="h-2.5" />
            </div>
          </div>
          <BtnPh text={props.d1_cta || 'Bestel online'} editing={editing} fieldKey="d1_cta" onPropChange={onPropChange} />
        </div>
        <div className="w-px bg-gray-200" />
        <div className="flex-1 flex flex-col justify-center gap-5 px-10 py-10">
          <IconPh size="w-12 h-12" />
          <div className="space-y-2">
            <Tx value={props.d2_title} fieldKey="d2_title" placeholder="Afhalen" editing={editing} onPropChange={onPropChange} className="text-xl font-bold text-gray-900" barWidth="w-28" />
            <div className="space-y-1.5">
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-3/4" h="h-2.5" />
            </div>
          </div>
          <BtnPh text={props.d2_cta || 'Bel om te bestellen'} editing={editing} fieldKey="d2_cta" onPropChange={onPropChange} />
        </div>
      </div>
    )
  }

  // Food gallery
  return (
    <Section>
      <div className="flex items-center justify-between mb-6">
        <Tx value={props.title} fieldKey="title" placeholder="Onze gerechten" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-40" />
        <div className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-lg">Alles zien</div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '120px 120px' }}>
        <ImgPh className="row-span-2 !h-[248px] rounded-xl" aspect="aspect-auto" />
        <ImgPh className="rounded-xl" aspect="aspect-auto" />
        <ImgPh className="rounded-xl" aspect="aspect-auto" />
        <ImgPh className="rounded-xl" aspect="aspect-auto" />
        <ImgPh className="rounded-xl bg-gray-400" aspect="aspect-auto" />
        <ImgPh className="rounded-xl" aspect="aspect-auto" />
        <ImgPh className="rounded-xl" aspect="aspect-auto" />
      </div>
    </Section>
  )
}
