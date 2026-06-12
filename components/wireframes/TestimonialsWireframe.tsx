import { WireframeProps, Ph, AvatarPh, Stars, Section } from './shared'

export default function TestimonialsWireframe({ props, variant }: WireframeProps) {
  if (variant === 'featured') {
    return (
      <Section>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Stars />
          <div className="text-xl text-gray-700 italic">
            {props.quote ? `"${props.quote}"` : (
              <div className="space-y-2 flex flex-col items-center">
                <Ph w="w-full" h="h-4" />
                <Ph w="w-5/6" h="h-4" />
                <Ph w="w-4/6" h="h-4" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <AvatarPh size="w-12 h-12" />
            <div className="text-left">
              {props.name ? (
                <div className="font-semibold text-gray-900">{props.name}</div>
              ) : <Ph w="w-28" h="h-3" />}
              {props.role ? (
                <div className="text-sm text-gray-500">{props.role}</div>
              ) : <Ph w="w-36" h="h-2.5" className="mt-1" />}
            </div>
          </div>
        </div>
      </Section>
    )
  }

  // grid-3
  const testimonials = [
    { text: props.t1_text, name: props.t1_name, role: props.t1_role },
    { text: props.t2_text, name: props.t2_name, role: props.t2_role },
    { text: props.t3_text, name: props.t3_name, role: props.t3_role },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-64 mx-auto" h="h-6" />}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6 space-y-4">
            <Stars />
            <div className="text-sm text-gray-600">
              {t.text ? `"${t.text}"` : (
                <div className="space-y-2">
                  <Ph h="h-2.5" />
                  <Ph w="w-5/6" h="h-2.5" />
                  <Ph w="w-4/6" h="h-2.5" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <AvatarPh />
              <div>
                {t.name ? <div className="text-sm font-semibold">{t.name}</div> : <Ph w="w-20" h="h-2.5" />}
                {t.role ? <div className="text-xs text-gray-400">{t.role}</div> : <Ph w="w-28" h="h-2" className="mt-1" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
