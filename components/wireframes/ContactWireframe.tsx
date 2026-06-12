import { WireframeProps, Ph, BtnPh, Section, Tx } from './shared'

function InputPh({ label }: { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label ? <div className="text-xs font-medium text-gray-600">{label}</div> : <Ph w="w-16" h="h-2.5" />}
      <div className="h-9 bg-gray-100 rounded-lg border border-gray-200" />
    </div>
  )
}

export default function ContactWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'centered') {
    return (
      <Section>
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <Tx
              value={props.title}
              fieldKey="title"
              placeholder="Stuur een bericht"
              editing={editing}
              onPropChange={onPropChange}
              className="text-3xl font-bold text-gray-900"
              barWidth="w-48"
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputPh label="Naam" />
              <InputPh label="Email" />
            </div>
            <InputPh label="Onderwerp" />
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-gray-600">Bericht</div>
              <div className="h-28 bg-gray-100 rounded-lg border border-gray-200" />
            </div>
            <BtnPh text={props.cta || 'Versturen'} className="w-full justify-center" editing={editing} fieldKey="cta" onPropChange={onPropChange} />
          </div>
        </div>
      </Section>
    )
  }

  // split
  return (
    <Section>
      <div className="grid grid-cols-2 gap-12 items-start">
        <div className="space-y-5">
          <Tx
            value={props.title}
            fieldKey="title"
            placeholder="Neem contact op"
            editing={editing}
            onPropChange={onPropChange}
            className="text-3xl font-bold text-gray-900"
            barWidth="w-3/4"
          />
          <Tx
            value={props.subtitle}
            fieldKey="subtitle"
            placeholder="We horen graag van je."
            editing={editing}
            onPropChange={onPropChange}
            className="text-gray-500"
            barWidth="w-full"
            multiline={true}
          />
          <div className="space-y-3 pt-2">
            {[
              { icon: '✉', valueKey: 'email', placeholder: 'info@bedrijf.be' },
              { icon: '📞', valueKey: 'phone', placeholder: '+32 000 00 00 00' },
              { icon: '📍', valueKey: 'address', placeholder: 'Brussel, België' },
            ].map(({ icon, valueKey, placeholder }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">{icon}</div>
                <Tx
                  value={props[valueKey]}
                  fieldKey={valueKey}
                  placeholder={placeholder}
                  editing={editing}
                  onPropChange={onPropChange}
                  className="text-sm text-gray-600"
                  barWidth="w-36"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputPh label="Naam" />
            <InputPh label="Email" />
          </div>
          <InputPh label="Onderwerp" />
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-600">Bericht</div>
            <div className="h-24 bg-white rounded-lg border border-gray-200" />
          </div>
          <BtnPh text={props.cta || 'Versturen'} className="w-full justify-center" editing={editing} fieldKey="cta" onPropChange={onPropChange} />
        </div>
      </div>
    </Section>
  )
}
