import { WireframeProps, Ph, ImgPh, IconPh, Section } from './shared'

export default function FeaturesWireframe({ props, variant }: WireframeProps) {
  if (variant === 'list-split') {
    return (
      <Section>
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {props.title ? (
              <h2 className="text-4xl font-bold text-gray-900">{props.title}</h2>
            ) : (
              <div className="space-y-2">
                <Ph w="w-full" h="h-6" />
                <Ph w="w-4/5" h="h-6" />
              </div>
            )}
            {props.subtitle ? (
              <p className="text-gray-500">{props.subtitle}</p>
            ) : (
              <div className="space-y-2">
                <Ph h="h-3" />
                <Ph w="w-5/6" h="h-3" />
              </div>
            )}
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
          {props.title ? (
            <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
          ) : <Ph w="w-48 mx-auto" h="h-6" />}
        </div>
        <div className="space-y-16">
          {[
            { titleKey: 'f1_title', descKey: 'f1_desc' },
            { titleKey: 'f2_title', descKey: 'f2_desc' },
          ].map(({ titleKey, descKey }, i) => (
            <div key={i} className={`grid grid-cols-2 gap-12 items-center ${i % 2 === 1 ? '' : ''}`}>
              {i % 2 === 0 ? (
                <>
                  <div className="space-y-3">
                    {props[titleKey] ? (
                      <h3 className="text-2xl font-bold text-gray-900">{props[titleKey]}</h3>
                    ) : <Ph w="w-48" h="h-5" />}
                    {props[descKey] ? (
                      <p className="text-gray-500">{props[descKey]}</p>
                    ) : (
                      <div className="space-y-2">
                        <Ph h="h-3" />
                        <Ph w="w-5/6" h="h-3" />
                      </div>
                    )}
                  </div>
                  <ImgPh />
                </>
              ) : (
                <>
                  <ImgPh />
                  <div className="space-y-3">
                    {props[titleKey] ? (
                      <h3 className="text-2xl font-bold text-gray-900">{props[titleKey]}</h3>
                    ) : <Ph w="w-48" h="h-5" />}
                    {props[descKey] ? (
                      <p className="text-gray-500">{props[descKey]}</p>
                    ) : (
                      <div className="space-y-2">
                        <Ph h="h-3" />
                        <Ph w="w-5/6" h="h-3" />
                      </div>
                    )}
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
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-64 mx-auto" h="h-6" />}
      </div>
      <div className="grid grid-cols-3 gap-8">
        {[
          { titleKey: 'f1_title', descKey: 'f1_desc' },
          { titleKey: 'f2_title', descKey: 'f2_desc' },
          { titleKey: 'f3_title', descKey: 'f3_desc' },
        ].map(({ titleKey, descKey }, i) => (
          <div key={i} className="space-y-3">
            <IconPh />
            {props[titleKey] ? (
              <h3 className="font-semibold text-gray-900">{props[titleKey]}</h3>
            ) : <Ph w="w-32" h="h-4" />}
            {props[descKey] ? (
              <p className="text-sm text-gray-500">{props[descKey]}</p>
            ) : (
              <div className="space-y-2">
                <Ph h="h-2.5" />
                <Ph w="w-5/6" h="h-2.5" />
                <Ph w="w-4/6" h="h-2.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
