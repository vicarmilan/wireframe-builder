import { WireframeProps, Ph, BtnPh, Section } from './shared'

export default function PricingWireframe({ props }: WireframeProps) {
  const plans = [
    { name: props.p1_name, price: props.p1_price, featured: false },
    { name: props.p2_name, price: props.p2_price, featured: true },
    { name: props.p3_name, price: props.p3_price, featured: false },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-48 mx-auto" h="h-6" />}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 space-y-4 ${plan.featured ? 'bg-[#2563EB] text-white' : 'bg-gray-50'}`}
          >
            {plan.name ? (
              <div className={`font-semibold ${plan.featured ? 'text-white/80' : 'text-gray-500'} text-sm uppercase tracking-wide`}>
                {plan.name}
              </div>
            ) : <Ph w="w-16" h="h-2.5" className={plan.featured ? 'bg-white/30' : ''} />}
            {plan.price ? (
              <div className={`text-3xl font-black ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.price}</div>
            ) : <Ph w="w-24" h="h-8" className={plan.featured ? 'bg-white/30' : ''} />}
            <div className="space-y-2 py-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${plan.featured ? 'bg-white/40' : 'bg-blue-100'}`} />
                  <Ph w="w-full" h="h-2.5" className={plan.featured ? 'bg-white/30' : ''} />
                </div>
              ))}
            </div>
            <BtnPh
              text={plan.featured ? 'Aan de slag' : 'Selecteren'}
              className={plan.featured ? 'bg-white text-[#2563EB] w-full justify-center' : 'w-full justify-center'}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
