import { WireframeProps, Ph, ImgPh, IconPh, Section, Tx } from './shared'

export default function FeaturesWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'list-split') {
    return (
      <Section>
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Tx
              value={props.title}
              fieldKey="title"
              placeholder="Alles wat je nodig hebt"
              editing={editing}
              onPropChange={onPropChange}
              className="text-4xl font-bold text-gray-900"
              barWidth="w-full"
              multiline={true}
            />
            <Tx
              value={props.subtitle}
              fieldKey="subtitle"
              placeholder="Een korte beschrijving van je aanbod."
              editing={editing}
              onPropChange={onPropChange}
              className="text-gray-500"
              barWidth="w-full"
              multiline={true}
            />
            <div className="space-y-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-4 h-4 bg-blue-100 rounded flex-shrink-0 mt-0.5" />
                  <Ph w="w-48" h="h-3" />
                </div>
              ))}
            </div>
          </div>
          <ImgPh aspect="aspect-square" />
        </div>
      </Section>
    )
  }

  if (variant === 'alternating') {
    return (
      <Section>
        <div className="text-center mb-12">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Hoe het werkt"
            editing={editing}
            onPropChange={onPropChange}
            className="text-3xl font-bold text-gray-900"
            barWidth="w-48"
          />
        </div>
        <div className="space-y-16">
          {[
            { titleKey: 'f1_title', descKey: 'f1_desc', titlePlaceholder: 'Stap 1', descPlaceholder: 'Beschrijving van stap 1.' },
            { titleKey: 'f2_title', descKey: 'f2_desc', titlePlaceholder: 'Stap 2', descPlaceholder: 'Beschrijving van stap 2.' },
          ].map(({ titleKey, descKey, titlePlaceholder, descPlaceholder }, i) => (
            <div key={i} className={`grid grid-cols-2 gap-12 items-center ${i % 2 === 1 ? '' : ''}`}>
              {i % 2 === 0 ? (
                <>
                  <div className="space-y-3">
                    <Tx
                      value={props[titleKey]}
                      fieldKey={titleKey}
                      placeholder={titlePlaceholder}
                      editing={editing}
                      onPropChange={onPropChange}
                      className="text-2xl font-bold text-gray-900"
                      barWidth="w-48"
                    />
                    <Tx
                      value={props[descKey]}
                      fieldKey={descKey}
                      placeholder={descPlaceholder}
                      editing={editing}
                      onPropChange={onPropChange}
                      className="text-gray-500"
                      barWidth="w-full"
                      multiline={true}
                    />
                  </div>
                  <ImgPh />
                </>
              ) : (
                <>
                  <ImgPh />
                  <div className="space-y-3">
                    <Tx
                      value={props[titleKey]}
                      fieldKey={titleKey}
                      placeholder={titlePlaceholder}
                      editing={editing}
                      onPropChange={onPropChange}
                      className="text-2xl font-bold text-gray-900"
                      barWidth="w-48"
                    />
                    <Tx
                      value={props[descKey]}
                      fieldKey={descKey}
                      placeholder={descPlaceholder}
                      editing={editing}
                      onPropChange={onPropChange}
                      className="text-gray-500"
                      barWidth="w-full"
                      multiline={true}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Section>
    )
  }

  if (variant === 'grid-4') {
    return (
      <Section>
        <div className="flex items-end justify-between mb-10 gap-8">
          <div className="space-y-2 max-w-sm">
            <Tx value={props.title} fieldKey="title" placeholder="Alles wat je nodig hebt" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-full" multiline={true} />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <Ph w="w-full" h="h-2.5" />
            <Ph w="w-5/6" h="h-2.5" />
            <Ph w="w-4/5" h="h-2.5" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { tk: 'f1_title', dk: 'f1_desc', tph: 'Snel', dph: 'Korte beschrijving.' },
            { tk: 'f2_title', dk: 'f2_desc', tph: 'Betrouwbaar', dph: 'Korte beschrijving.' },
            { tk: 'f3_title', dk: 'f3_desc', tph: 'Schaalbaar', dph: 'Korte beschrijving.' },
            { tk: 'f4_title', dk: 'f4_desc', tph: 'Veilig', dph: 'Korte beschrijving.' },
          ].map(({ tk, dk, tph, dph }, i) => (
            <div key={i} className="space-y-3">
              <IconPh size="w-10 h-10" />
              <Tx value={props[tk]} fieldKey={tk} placeholder={tph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-sm" barWidth="w-24" />
              <Tx value={props[dk]} fieldKey={dk} placeholder={dph} editing={editing} onPropChange={onPropChange} className="text-xs text-gray-500" barWidth="w-full" multiline={true} />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  if (variant === 'numbered') {
    return (
      <Section>
        <div className="text-center mb-10 space-y-2">
          <Tx value={props.title} fieldKey="title" placeholder="Hoe het werkt" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-48" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="In 3 eenvoudige stappen." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-48" />
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            { num: '01.', tk: 'f1_title', dk: 'f1_desc', tph: 'Aanmelden', dph: 'Maak gratis een account aan.' },
            { num: '02.', tk: 'f2_title', dk: 'f2_desc', tph: 'Instellen', dph: 'Configureer je werkruimte.' },
            { num: '03.', tk: 'f3_title', dk: 'f3_desc', tph: 'Aan de slag', dph: 'Begin meteen met werken.' },
          ].map(({ num, tk, dk, tph, dph }, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-[#2563EB] leading-none">{num}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Tx value={props[tk]} fieldKey={tk} placeholder={tph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900" barWidth="w-28" />
              <Tx value={props[dk]} fieldKey={dk} placeholder={dph} editing={editing} onPropChange={onPropChange} className="text-sm text-gray-500" barWidth="w-full" multiline={true} />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  if (variant === 'timeline') {
    return (
      <Section>
        <div className="text-center mb-10 space-y-2">
          <Tx value={props.title} fieldKey="title" placeholder="Ons proces" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900" barWidth="w-40" />
          <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Stap voor stap naar resultaat." editing={editing} onPropChange={onPropChange} className="text-gray-500" barWidth="w-48" />
        </div>
        <div className="flex items-start">
          {[
            { num: '1', tk: 'f1_title', dk: 'f1_desc', tph: 'Intake', dph: 'We leren je kennen.' },
            { num: '2', tk: 'f2_title', dk: 'f2_desc', tph: 'Ontwerp', dph: 'We bouwen een wireframe.' },
            { num: '3', tk: 'f3_title', dk: 'f3_desc', tph: 'Bouw', dph: 'We ontwikkelen het product.' },
            { num: '4', tk: 'f4_title', dk: 'f4_desc', tph: 'Lancering', dph: 'We gaan live samen.' },
          ].map(({ num, tk, dk, tph, dph }, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div className={`flex-1 h-px ${i === 0 ? 'opacity-0' : 'bg-gray-200'}`} />
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</div>
                <div className={`flex-1 h-px ${i === 3 ? 'opacity-0' : 'bg-gray-200'}`} />
              </div>
              <div className="w-px h-7 bg-gray-200" />
              <div className="text-center space-y-1.5 px-3">
                <Tx value={props[tk]} fieldKey={tk} placeholder={tph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-sm" barWidth="w-20" />
                <Tx value={props[dk]} fieldKey={dk} placeholder={dph} editing={editing} onPropChange={onPropChange} className="text-xs text-gray-500" barWidth="w-full" multiline={true} />
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <Tx value={props.title} fieldKey="title" placeholder="Krachtige features" editing={editing} onPropChange={onPropChange} className="text-2xl font-bold text-white" barWidth="w-56" multiline={true} />
              <Tx value={props.subtitle} fieldKey="subtitle" placeholder="Alles in één platform." editing={editing} onPropChange={onPropChange} className="text-white/60" barWidth="w-64" />
            </div>
            <div className="bg-[#2563EB] text-white text-xs px-4 py-2 rounded font-medium">
              <Tx value={props.cta} fieldKey="cta" placeholder="Alle features" editing={editing} onPropChange={onPropChange} className="" barWidth="w-20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { tk: 'f1_title', dk: 'f1_desc', tph: 'Feature 1', dph: 'Korte beschrijving.' },
              { tk: 'f2_title', dk: 'f2_desc', tph: 'Feature 2', dph: 'Korte beschrijving.' },
              { tk: 'f3_title', dk: 'f3_desc', tph: 'Feature 3', dph: 'Korte beschrijving.' },
            ].map(({ tk, dk, tph, dph }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <IconPh size="w-10 h-10" />
                <Tx value={props[tk]} fieldKey={tk} placeholder={tph} editing={editing} onPropChange={onPropChange} className="font-semibold text-white" barWidth="w-28" />
                <div className="space-y-1.5">
                  <Tx value={props[dk]} fieldKey={dk} placeholder={dph} editing={editing} onPropChange={onPropChange} className="text-xs text-white/50" barWidth="w-full" multiline={true} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // grid-3
  return (
    <Section>
      <div className="text-center mb-12">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Waarom kiezen voor ons?"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-64"
        />
      </div>
      <div className="grid grid-cols-3 gap-8">
        {[
          { titleKey: 'f1_title', descKey: 'f1_desc', titlePh: 'Snel & betrouwbaar', descPh: 'Korte omschrijving van deze feature.' },
          { titleKey: 'f2_title', descKey: 'f2_desc', titlePh: 'Eenvoudig te gebruiken', descPh: 'Korte omschrijving van deze feature.' },
          { titleKey: 'f3_title', descKey: 'f3_desc', titlePh: 'Altijd beschikbaar', descPh: 'Korte omschrijving van deze feature.' },
        ].map(({ titleKey, descKey, titlePh, descPh }, i) => (
          <div key={i} className="space-y-3">
            <IconPh />
            <Tx
              value={props[titleKey]}
              fieldKey={titleKey}
              placeholder={titlePh}
              editing={editing}
              onPropChange={onPropChange}
              className="font-semibold text-gray-900"
              barWidth="w-32"
            />
            <Tx
              value={props[descKey]}
              fieldKey={descKey}
              placeholder={descPh}
              editing={editing}
              onPropChange={onPropChange}
              className="text-sm text-gray-500"
              barWidth="w-full"
              multiline={true}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
