import { WireframeProps, Ph, ImgPh, Section } from './shared'

export default function BlogWireframe({ props }: WireframeProps) {
  const articles = [
    { title: props.a1_title, date: props.a1_date },
    { title: props.a2_title, date: props.a2_date },
    { title: props.a3_title, date: props.a3_date },
  ]

  return (
    <Section>
      <div className="flex items-center justify-between mb-10">
        {props.title ? (
          <h2 className="text-3xl font-bold text-gray-900">{props.title}</h2>
        ) : <Ph w="w-40" h="h-6" />}
        <Ph w="w-24" h="h-8" className="rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {articles.map((a, i) => (
          <div key={i} className="space-y-3">
            <ImgPh aspect="aspect-video" />
            <div className="space-y-2">
              <Ph w="w-16" h="h-2.5" />
              {a.title ? (
                <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
              ) : (
                <div className="space-y-1.5">
                  <Ph h="h-3" />
                  <Ph w="w-4/5" h="h-3" />
                </div>
              )}
              <div className="space-y-1.5">
                <Ph h="h-2.5" />
                <Ph w="w-5/6" h="h-2.5" />
              </div>
              {a.date ? (
                <div className="text-xs text-gray-400">{a.date}</div>
              ) : <Ph w="w-20" h="h-2" />}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
