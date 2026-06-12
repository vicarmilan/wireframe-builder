import { WireframeProps, Ph, ImgPh, Section } from './shared'

export default function PortfolioWireframe({ props }: WireframeProps) {
  const projects = [
    { title: props.p1_title, cat: props.p1_cat },
    { title: props.p2_title, cat: props.p2_cat },
    { title: props.p3_title, cat: props.p3_cat },
  ]

  return (
    <Section>
      <div className="flex items-center justify-between mb-10">
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-32" h="h-6" />}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Ph key={i} w="w-16" h="h-7" className="rounded-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <div key={i} className="group cursor-pointer">
            <ImgPh aspect="aspect-[4/3]" className="mb-3" />
            <div className="space-y-1">
              {p.cat ? (
                <div className="text-xs text-[#2563EB] font-medium">{p.cat}</div>
              ) : <Ph w="w-16" h="h-2.5" />}
              {p.title ? (
                <div className="font-semibold text-gray-900">{p.title}</div>
              ) : <Ph w="w-32" h="h-3.5" />}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
