import { WireframeProps, Ph, AvatarPh, Section, Tx } from './shared'

export default function TeamWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  const members = [
    { nameKey: 'm1_name', roleKey: 'm1_role', namePh: 'Jan Janssen', rolePh: 'CEO & Founder' },
    { nameKey: 'm2_name', roleKey: 'm2_role', namePh: 'Marie Pieters', rolePh: 'Designer' },
    { nameKey: 'm3_name', roleKey: 'm3_role', namePh: 'Tom Claes', rolePh: 'Developer' },
    { nameKey: undefined, roleKey: undefined, namePh: '', rolePh: '' },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        <Tx
          value={props.title}
          fieldKey="title"
          placeholder="Ons team"
          editing={editing}
          onPropChange={onPropChange}
          className="text-3xl font-bold text-gray-900"
          barWidth="w-32"
        />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {members.map(({ nameKey, roleKey, namePh, rolePh }, i) => (
          <div key={i} className="text-center space-y-3">
            <AvatarPh size="w-20 h-20 mx-auto" />
            {nameKey ? (
              <Tx
                value={props[nameKey]}
                fieldKey={nameKey}
                placeholder={namePh}
                editing={editing}
                onPropChange={onPropChange}
                className="font-semibold text-gray-900 text-sm"
                barWidth="w-24"
              />
            ) : <Ph w="w-24 mx-auto" h="h-3" />}
            {roleKey ? (
              <Tx
                value={props[roleKey]}
                fieldKey={roleKey}
                placeholder={rolePh}
                editing={editing}
                onPropChange={onPropChange}
                className="text-xs text-gray-400"
                barWidth="w-20"
              />
            ) : <Ph w="w-20 mx-auto" h="h-2.5" />}
          </div>
        ))}
      </div>
    </Section>
  )
}
