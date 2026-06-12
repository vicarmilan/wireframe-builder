import { WireframeProps, Ph, BtnPh, BtnOutlinePh, Tx } from './shared'

export default function CtaWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
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
          <BtnPh text={props.cta} className="bg-white text-[#2563EB]" />
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
          <BtnPh text={props.cta_primary} />
          <BtnOutlinePh text={props.cta_secondary} />
        </div>
      </div>
    </section>
  )
}
