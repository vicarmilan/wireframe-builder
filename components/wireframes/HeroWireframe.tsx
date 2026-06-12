import { WireframeProps, Ph, ImgPh, BtnPh, BtnOutlinePh, Section, Tx, AvatarPh } from './shared'

export default function HeroWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'split') {
    return (
      <Section>
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="space-y-2">
              <Tx
                value={props.title}
                fieldKey="title"
                placeholder="Jouw titel hier"
                editing={editing}
                onPropChange={onPropChange}
                className="text-4xl font-bold text-gray-900 leading-tight"
                barWidth="w-full"
                multiline={true}
              />
            </div>
            <Tx
              value={props.subtitle}
              fieldKey="subtitle"
              placeholder="Korte beschrijving van je dienst of product."
              editing={editing}
              onPropChange={onPropChange}
              className="text-gray-500"
              barWidth="w-full"
              multiline={true}
            />
            <div className="flex gap-3">
              <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
              <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
            </div>
          </div>
          <ImgPh aspect="aspect-[4/3]" />
        </div>
      </Section>
    )
  }

  if (variant === 'video') {
    return (
      <section className="relative bg-gray-900 py-24 px-8">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <Tx
              value={props.title}
              fieldKey="title"
              placeholder="Indrukwekkende titel"
              editing={editing}
              onPropChange={onPropChange}
              className="text-5xl font-bold text-white leading-tight"
              barWidth="w-2/3"
              multiline={true}
            />
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 border border-white/30 text-white/70 px-5 py-2.5 rounded text-sm">
              <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">▶</div>
              {props.cta_primary || <Ph w="w-20" h="h-3" className="bg-white/20" />}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'minimal') {
    return (
      <Section>
        <div className="max-w-3xl space-y-6">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Wij maken geweldige websites"
            editing={editing}
            onPropChange={onPropChange}
            className="text-6xl font-black text-gray-900 leading-none"
            barWidth="w-full"
            multiline={true}
          />
          <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
        </div>
      </Section>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <div className="bg-[#C8CFD8] h-96" />
        <div className="absolute inset-0 flex items-center px-16"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}>
          <div className="space-y-5 max-w-lg">
            <div className="space-y-2">
              <div className="h-8 bg-white/90 rounded w-60" />
              <div className="h-8 bg-white/90 rounded w-72" />
              <div className="h-8 bg-white/60 rounded w-48" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-white/50 rounded w-80" />
              <div className="h-3 bg-white/50 rounded w-72" />
            </div>
            <div className="flex gap-3 pt-1">
              <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
              <div className="border border-white/50 text-white/80 text-xs px-4 py-2 rounded">
                {props.cta_secondary || <Ph w="w-20" h="h-3" className="bg-white/30" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'dark-split') {
    return (
      <div className="overflow-hidden rounded-xl flex" style={{ minHeight: 340 }}>
        <div className="bg-gray-900 flex-1 flex flex-col justify-center gap-6 px-12 py-12">
          <div className="space-y-2">
            <div className="h-7 bg-white/85 rounded w-56" />
            <div className="h-7 bg-white/85 rounded w-64" />
            <div className="h-7 bg-white/60 rounded w-44" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-white/30 rounded w-full" />
            <div className="h-3 bg-white/30 rounded w-11/12" />
            <div className="h-3 bg-white/30 rounded w-3/4" />
          </div>
          <div className="flex gap-3">
            <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
            <div className="border border-white/30 text-white/70 text-xs px-4 py-2 rounded">
              {props.cta_secondary || <Ph w="w-20" h="h-3" className="bg-white/20" />}
            </div>
          </div>
        </div>
        <div className="bg-[#C8CFD8] flex-1" />
      </div>
    )
  }

  if (variant === 'availability') {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <div className="bg-[#C8CFD8] h-80" />
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-7 px-8">
          <div className="text-center space-y-3">
            <div className="h-9 bg-white/90 rounded w-80 mx-auto" />
            <div className="h-5 bg-white/60 rounded w-56 mx-auto" />
          </div>
          <div className="bg-white rounded-xl flex items-stretch w-full max-w-2xl shadow-lg overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex-1 px-4 py-3 space-y-1 ${i < 3 ? 'border-r border-gray-200' : ''}`}>
                <Ph w="w-16" h="h-2" />
                <Ph w="w-24" h="h-3" />
              </div>
            ))}
            <div className="flex-shrink-0 m-1.5">
              <BtnPh text={props.cta_primary || 'Beschikbaarheid'} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'newsletter') {
    return (
      <Section>
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Blijf op de hoogte"
            editing={editing}
            onPropChange={onPropChange}
            className="text-4xl font-bold text-gray-900"
            barWidth="w-2/3"
            multiline={true}
          />
          <Tx
            value={props.subtitle}
            fieldKey="subtitle"
            placeholder="Schrijf je in en ontvang nieuws en updates."
            editing={editing}
            onPropChange={onPropChange}
            className="text-gray-500"
            barWidth="w-1/2"
          />
          <div className="flex max-w-md mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex-1 px-4 py-3">
              <Ph w="w-40" h="h-2.5" />
            </div>
            <BtnPh text={props.cta_primary || 'Inschrijven'} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} className="rounded-none" />
          </div>
          <Ph w="w-48" h="h-2" className="mx-auto" />
        </div>
      </Section>
    )
  }

  if (variant === 'social-proof') {
    return (
      <Section>
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Tx
              value={props.title}
              fieldKey="title"
              placeholder="Vertrouwd door meer dan 10.000 bedrijven"
              editing={editing}
              onPropChange={onPropChange}
              className="text-4xl font-bold text-gray-900 leading-tight"
              barWidth="w-full"
              multiline={true}
            />
            <Tx
              value={props.subtitle}
              fieldKey="subtitle"
              placeholder="Sluit je aan bij duizenden tevreden klanten."
              editing={editing}
              onPropChange={onPropChange}
              className="text-gray-500"
              barWidth="w-full"
            />
            <div className="flex gap-3">
              <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
              <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
            </div>
            {/* Social proof badges */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => <AvatarPh key={i} size="w-8 h-8 border-2 border-white" />)}
              </div>
              <div className="space-y-0.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 bg-[#2563EB] rounded-sm" />)}
                </div>
                <Ph w="w-32" h="h-2" />
              </div>
            </div>
          </div>
          <ImgPh aspect="aspect-[4/3]" />
        </div>
      </Section>
    )
  }

  // centered
  return (
    <Section>
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        {props.eyebrow && (
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
            {props.eyebrow}
          </div>
        )}
        <div className="space-y-2">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="De beste oplossing voor jouw bedrijf"
            editing={editing}
            onPropChange={onPropChange}
            className="text-5xl font-bold text-gray-900 leading-tight"
            barWidth="w-3/4"
            multiline={true}
          />
        </div>
        <Tx
          value={props.subtitle}
          fieldKey="subtitle"
          placeholder="Beschrijf hier kort wat je doet en welke waarde je biedt."
          editing={editing}
          onPropChange={onPropChange}
          className="text-gray-500 text-lg max-w-xl mx-auto"
          barWidth="w-2/3"
          multiline={true}
        />
        <div className="flex gap-3 justify-center">
          <BtnPh text={props.cta_primary} editing={editing} fieldKey="cta_primary" onPropChange={onPropChange} />
          <BtnOutlinePh text={props.cta_secondary} editing={editing} fieldKey="cta_secondary" onPropChange={onPropChange} />
        </div>
        <div className="pt-4">
          <ImgPh aspect="aspect-video" className="max-w-2xl mx-auto" />
        </div>
      </div>
    </Section>
  )
}
