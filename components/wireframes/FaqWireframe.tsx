import { WireframeProps, Ph, Section } from './shared'

export default function FaqWireframe({ props }: WireframeProps) {
  const faqs = [
    { q: props.q1, a: props.a1 },
    { q: props.q2, a: props.a2 },
    { q: props.q3, a: props.a3 },
    { q: undefined, a: undefined },
    { q: undefined, a: undefined },
  ]

  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          {props.title ? (
            <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
          ) : <Ph w="w-56 mx-auto" h="h-6" />}
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                {faq.q ? (
                  <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                ) : <Ph w="w-64" h="h-3" />}
                <div className="w-5 h-5 bg-[#C8CFD8] rounded flex-shrink-0 ml-4" />
              </div>
              {faq.a && i === 0 && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
