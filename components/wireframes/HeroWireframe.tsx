import { WireframeProps, Ph, ImgPh, BtnPh, BtnOutlinePh, Section } from './shared'

export default function HeroWireframe({ props, variant }: WireframeProps) {
  if (variant === 'split') {
    return (
      <Section>
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="space-y-2">
              {props.title ? (
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">{props.title}</h1>
              ) : (
                <div className="space-y-2">
                  <Ph w="w-full" h="h-5" />
                  <Ph w="w-4/5" h="h-5" />
                  <Ph w="w-3/5" h="h-5" />
                </div>
              )}
            </div>
            {props.subtitle ? (
              <p className="text-gray-500">{props.subtitle}</p>
            ) : (
              <div className="space-y-2">
                <Ph w="w-full" h="h-3" />
                <Ph w="w-5/6" h="h-3" />
                <Ph w="w-4/6" h="h-3" />
              </div>
            )}
            <div className="flex gap-3">
              <BtnPh text={props.cta_primary} />
              <BtnOutlinePh text={props.cta_secondary} />
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
            {props.title ? (
              <h1 className="text-5xl font-bold text-white leading-tight">{props.title}</h1>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <Ph w="w-2/3" h="h-6" className="bg-white/20" />
                <Ph w="w-1/2" h="h-6" className="bg-white/20" />
              </div>
            )}
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
          {props.title ? (
            <h1 className="text-6xl font-black text-gray-900 leading-none">{props.title}</h1>
          ) : (
            <div className="space-y-3">
              <Ph w="w-full" h="h-10" />
              <Ph w="w-3/4" h="h-10" />
            </div>
          )}
          <BtnPh text={props.cta_primary} />
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
          {props.title ? (
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">{props.title}</h1>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <Ph w="w-3/4" h="h-8" />
              <Ph w="w-1/2" h="h-8" />
            </div>
          )}
        </div>
        {props.subtitle ? (
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{props.subtitle}</p>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <Ph w="w-2/3" h="h-3" />
            <Ph w="w-1/2" h="h-3" />
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <BtnPh text={props.cta_primary} />
          <BtnOutlinePh text={props.cta_secondary} />
        </div>
        <div className="pt-4">
          <ImgPh aspect="aspect-video" className="max-w-2xl mx-auto" />
        </div>
      </div>
    </Section>
  )
}
