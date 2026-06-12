import { WireframeProps, Ph, IconPh, BtnPh, BtnOutlinePh, ImgPh, Tx } from './shared'

export default function CtaWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'split') {
    return (
      <div className="overflow-hidden rounded-xl flex" style={{ minHeight: 280 }}>
        <div className="flex-1 bg-blue-50 flex flex-col justify-center gap-6 px-12 py-12">
          <div className="space-y-2">
            <Tx value={props.title} fieldKey="title" placeholder="Klaar om te starten?" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-full" multiline={true} />
          </div>
          <div className="space-y-1.5">
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-5/6" h="h-2.5" />
          </div>
          <div className="flex gap-3">
            <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
            <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
          </div>
        </div>
        <div className="bg-[#C8CFD8] flex-none w-2/5" />
      </div>
    )
  }

  if (variant === 'newsletter') {
    return (
      <section className="bg-gray-900 py-14 px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-16">
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-white/85 rounded w-64" />
            <div className="h-7 bg-white/85 rounded w-72" />
            <div className="h-3 bg-white/30 rounded w-60" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex rounded-xl overflow-hidden border border-white/15 bg-white/8">
              <div className="flex-1 px-4 py-3">
                <div className="h-2.5 bg-white/20 rounded w-4/5" />
              </div>
              <div className="bg-[#2563EB] text-white text-xs px-5 py-3 font-medium">
                <Tx value={props.cta} fieldKey="cta" placeholder="Inschrijven" editing={editing} onPropChange={onPropChange} className="" barWidth="w-16" />
              </div>
            </div>
            <div className="h-2.5 bg-white/15 rounded w-48" />
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'phone') {
    return (
      <section className="bg-white py-12 px-8 border-y border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 space-y-3">
            <Tx value={props.title} fieldKey="title" placeholder="Bel ons vrijblijvend" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-3/4" multiline={true} />
            <div className="space-y-1.5">
              <Ph w="w-full" h="h-2.5" />
              <Ph w="w-4/5" h="h-2.5" />
            </div>
          </div>
          <div className="text-center space-y-3 flex-shrink-0">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <IconPh size="w-7 h-7" />
            </div>
            <Tx value={props.phone} fieldKey="phone" placeholder="+32 XXX XX XX XX" editing={editing} onPropChange={onPropChange} className="text-2xl font-black text-[#2563EB] whitespace-nowrap" barWidth="w-40" />
            <Ph w="w-36" h="h-2.5" className="mx-auto" />
            <BtnPh text={props.cta_primary || 'Bel nu'} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'strip') {
    return (
      <div className="bg-blue-50 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <IconPh size="w-9 h-9" />
            <div className="space-y-1">
              <Ph w="w-48" h="h-3" />
              <Ph w="w-64" h="h-2" />
            </div>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
            <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <section className="bg-[#2563EB] py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Neem contact op"
            editing={editing}
            onPropChange={onPropChange}
            className="text-white font-bold text-xl"
            barWidth="w-64"
          />
          <BtnPh text={props.cta} light editing={editing} fieldKey="cta" onPropChange={onPropChange} />
        </div>
      </section>
    )
  }

  // centered
  return (
    <section className="bg-gray-50 py-20 px-8">
      <div className="max-w-6xl mx-auto text-center space-y-6">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Klaar om te beginnen?"
          editing={editing}
          onPropChange={onPropChange}
          className="text-4xl font-bold text-gray-900"
          barWidth="w-1/2"
          multiline={true}
        />
        <Tx
          value={props.subtitle}
          fieldKey="subtitle"
          placeholder="Start vandaag gratis."
          editing={editing}
          onPropChange={onPropChange}
          className="text-gray-500"
          barWidth="w-64"
        />
        <div className="flex gap-3 justify-center">
          <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
          <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
        </div>
      </div>
    </section>
  )
}
