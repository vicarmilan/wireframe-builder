import { WireframeProps, Ph, Section } from './shared'

export default function StatsWireframe({ props }: WireframeProps) {
  const stats = [
    { num: props.s1_num, label: props.s1_label },
    { num: props.s2_num, label: props.s2_label },
    { num: props.s3_num, label: props.s3_label },
    { num: props.s4_num, label: props.s4_label },
  ]

  return (
    <Section>
      <div className="grid grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-2">
            {stat.num ? (
              <div className="text-4xl font-black text-[#2563EB]">{stat.num}</div>
            ) : <Ph w="w-20 mx-auto" h="h-8" />}
            {stat.label ? (
              <div className="text-sm text-gray-500">{stat.label}</div>
            ) : <Ph w="w-16 mx-auto" h="h-2.5" />}
          </div>
        ))}
      </div>
    </Section>
  )
}
