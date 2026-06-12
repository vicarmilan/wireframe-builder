import { WireframeProps, Ph, BtnPh, Section } from './shared'

function InputPh({ label }: { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label ? <div className="text-xs font-medium text-gray-600">{label}</div> : <Ph w="w-16" h="h-2.5" />}
      <div className="h-9 bg-gray-100 rounded-lg border border-gray-200" />
    </div>
  )
}

export default function ContactWireframe({ props, variant }: WireframeProps) {
  if (variant === 'centered') {
    return (
      <Section>
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            {props.title ? (
              <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
            ) : <Ph w="w-48 mx-auto" h="h-6" />}
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
            <BtnPh text={props.cta || 'Versturen'} className="w-full justify-center" />
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
          {props.title ? (
            <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
          ) : (
            <div className="space-y-2">
              <Ph w="w-3/4" h="h-6" />
            </div>
          )}
          {props.subtitle ? (
            <p className="text-gray-500">{props.subtitle}</p>
          ) : (
            <div className="space-y-2">
              <Ph h="h-3" />
              <Ph w="w-4/5" h="h-3" />
            </div>
          )}
          <div className="space-y-3 pt-2">
            {[
              { icon: '✉', value: props.email },
              { icon: '📞', value: props.phone },
              { icon: '📍', value: props.address },
            ].map(({ icon, value }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">{icon}</div>
                {value ? (
                  <span className="text-sm text-gray-600">{value}</span>
                ) : <Ph w="w-36" h="h-2.5" />}
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
          <BtnPh text="Versturen" className="w-full justify-center" />
        </div>
      </div>
    </Section>
  )
}
