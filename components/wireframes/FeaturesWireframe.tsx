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
