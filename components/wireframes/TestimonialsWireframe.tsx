import { WireframeProps, Ph, AvatarPh, Stars, Section, Tx } from './shared'

export default function TestimonialsWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'featured') {
    return (
      <Section>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Stars />
          <div className="text-xl text-gray-700 italic">
            <Tx
              value={props.quote}
              fieldKey="quote"
              placeholder="Dit is de beste service die we ooit hebben gebruikt."
              editing={editing}
              onPropChange={onPropChange}
              className="text-xl text-gray-700 italic"
              barWidth="w-full"
              multiline={true}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <AvatarPh size="w-12 h-12" />
            <div className="text-left">
              <Tx
                value={props.name}
                fieldKey="name"
                placeholder="Jan Janssen"
                editing={editing}
                onPropChange={onPropChange}
                className="font-semibold text-gray-900"
                barWidth="w-28"
              />
              <Tx
                value={props.role}
                fieldKey="role"
                placeholder="CEO, Bedrijf X"
                editing={editing}
                onPropChange={onPropChange}
                className="text-sm text-gray-500"
                barWidth="w-36"
              />
            </div>
          </div>
        </div>
      </Section>
    )
  }

  // grid-3
  const testimonials = [
    { textKey: 't1_text', nameKey: 't1_name', roleKey: 't1_role', textPh: 'Super tevreden met de service!', namePh: 'Jan Janssen', rolePh: 'CEO, Bedrijf X' },
    { textKey: 't2_text', nameKey: 't2_name', roleKey: 't2_role', textPh: 'Aanrader voor iedereen.', namePh: 'Marie Pieters', rolePh: 'Marketing Manager' },
    { textKey: 't3_text', nameKey: 't3_name', roleKey: 't3_role', textPh: 'Uitstekende kwaliteit.', namePh: 'Tom Claes', rolePh: 'Designer' },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Wat onze klanten zeggen"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-64"
        />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {testimonials.map(({ textKey, nameKey, roleKey, textPh, namePh, rolePh }, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6 space-y-4">
            <Stars />
            <div className="text-sm text-gray-600">
              <Tx
                value={props[textKey]}
                fieldKey={textKey}
                placeholder={textPh}
                editing={editing}
                onPropChange={onPropChange}
                className="text-sm text-gray-600"
                barWidth="w-full"
                multiline={true}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <AvatarPh />
              <div>
                <Tx
                  value={props[nameKey]}
                  fieldKey={nameKey}
                  placeholder={namePh}
                  editing={editing}
                  onPropChange={onPropChange}
                  className="text-sm font-semibold"
                  barWidth="w-20"
                />
                <Tx
                  value={props[roleKey]}
                  fieldKey={roleKey}
                  placeholder={rolePh}
                  editing={editing}
                  onPropChange={onPropChange}
                  className="text-xs text-gray-400"
                  barWidth="w-28"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
