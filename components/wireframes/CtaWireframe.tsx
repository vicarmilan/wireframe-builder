import { WireframeProps, Ph, BtnPh, BtnOutlinePh } from './shared'

export default function CtaWireframe({ props, variant }: WireframeProps) {
  if (variant === 'banner') {
    return (
      <section className="bg-[#2563EB] py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {props.title ? (
            <h3 className="text-white font-bold text-xl">{props.title}</h3>
          ) : <Ph w="w-64" h="h-5" className="bg-white/30" />}
          <BtnPh text={props.cta} className="bg-white text-[#2563EB]" />
        </div>
      </section>
    )
  }

  // centered
  return (
    <section className="bg-gray-50 py-20 px-8">
      <div className="max-w-6xl mx-auto text-center space-y-6">
        {props.title ? (
          <h2 className="text-4xl font-bold text-gray-900">{props.title}</h2>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <Ph w="w-1/2" h="h-7" />
            <Ph w="w-1/3" h="h-7" />
          </div>
        )}
        {props.subtitle ? (
          <p className="text-gray-500">{props.subtitle}</p>
        ) : <Ph w="w-64 mx-auto" h="h-3" />}
        <div className="flex gap-3 justify-center">
          <BtnPh text={props.cta_primary} />
          <BtnOutlinePh text={props.cta_secondary} />
        </div>
      </div>
    </section>
  )
}
