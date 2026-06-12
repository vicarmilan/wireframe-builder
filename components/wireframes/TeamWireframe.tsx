import { WireframeProps, Ph, AvatarPh, Section } from './shared'

export default function TeamWireframe({ props }: WireframeProps) {
  const members = [
    { name: props.m1_name, role: props.m1_role },
    { name: props.m2_name, role: props.m2_role },
    { name: props.m3_name, role: props.m3_role },
    { name: undefined, role: undefined },
  ]

  return (
    <Section>
      <div className="text-center mb-10">
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-32 mx-auto" h="h-6" />}
      </div>
      <div className="grid grid-cols-4 gap-6">
        {members.map((m, i) => (
          <div key={i} className="text-center space-y-3">
            <AvatarPh size="w-20 h-20 mx-auto" />
            {m.name ? (
              <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
            ) : <Ph w="w-24 mx-auto" h="h-3" />}
            {m.role ? (
              <div className="text-xs text-gray-400">{m.role}</div>
            ) : <Ph w="w-20 mx-auto" h="h-2.5" />}
          </div>
        ))}
      </div>
    </Section>
  )
}
