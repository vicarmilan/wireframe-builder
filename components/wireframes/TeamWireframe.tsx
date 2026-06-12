import { WireframeProps, Ph, ImgPh, AvatarPh, Section, Tx } from './shared'

export default function TeamWireframe({ props, variant, editing, onPropChange }: WireframeProps) {
  if (variant === 'founder') {
    return (
      <Section>
        <Tx value={props.title} fieldKey="title" placeholder="Ons team" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900 mb-10" barWidth="w-40" />
        <div className="flex gap-8">
          {/* Founder */}
          <div className="w-56 flex-shrink-0 border border-gray-100 rounded-xl overflow-hidden">
            <ImgPh aspect="aspect-square" className="rounded-none" />
            <div className="p-5 space-y-2">
              <Tx value={props.m1_name} fieldKey="m1_name" placeholder="Founder naam" editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-sm" barWidth="w-28" />
              <Tx value={props.m1_role} fieldKey="m1_role" placeholder="CEO & Founder" editing={editing} onPropChange={onPropChange} className="text-xs text-gray-400" barWidth="w-20" />
              <div className="inline-block bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded-full mt-1">Founder</div>
              <div className="space-y-1 pt-1">
                <Ph w="w-full" h="h-2" />
                <Ph w="w-4/5" h="h-2" />
                <Ph w="w-3/4" h="h-2" />
              </div>
              <div className="flex gap-1.5 pt-1">
                {[...Array(3)].map((_, i) => <div key={i} className="w-6 h-6 bg-gray-100 rounded-full" />)}
              </div>
            </div>
          </div>
          {/* Team grid */}
          <div className="flex-1 grid grid-cols-3 gap-5 content-start">
            {[
              { nk: 'm2_name', rk: 'm2_role', nph: 'Teamlid', rph: 'Designer' },
              { nk: 'm3_name', rk: 'm3_role', nph: 'Teamlid', rph: 'Developer' },
              { nk: 'm4_name', rk: 'm4_role', nph: 'Teamlid', rph: 'Marketing' },
              { nk: 'm5_name', rk: 'm5_role', nph: 'Teamlid', rph: 'Sales' },
              { nk: 'm6_name', rk: 'm6_role', nph: 'Teamlid', rph: 'Support' },
              { nk: 'm7_name', rk: 'm7_role', nph: 'Teamlid', rph: 'HR' },
            ].map(({ nk, rk, nph, rph }, i) => (
              <div key={i} className="text-center space-y-2">
                <AvatarPh size="w-16 h-16 mx-auto" />
                <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900 text-xs" barWidth="w-20" />
                <Tx value={props[rk]} fieldKey={rk} placeholder={rph} editing={editing} onPropChange={onPropChange} className="text-xs text-gray-400" barWidth="w-16" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    )
  }

  if (variant === 'list') {
    return (
      <Section>
        <Tx value={props.title} fieldKey="title" placeholder="Ons team" editing={editing} onPropChange={onPropChange} className="text-3xl font-bold text-gray-900 mb-10" barWidth="w-40" />
        <div className="space-y-6">
          {[
            { nk: 'm1_name', rk: 'm1_role', nph: 'Jan Janssen', rph: 'CEO & Founder' },
            { nk: 'm2_name', rk: 'm2_role', nph: 'Marie Pieters', rph: 'Lead Designer' },
            { nk: 'm3_name', rk: 'm3_role', nph: 'Tom Claes', rph: 'Developer' },
          ].map(({ nk, rk, nph, rph }, i) => (
            <div key={i} className="flex items-center gap-5 border-b border-gray-100 pb-6 last:border-0">
              <AvatarPh size="w-16 h-16 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Tx value={props[nk]} fieldKey={nk} placeholder={nph} editing={editing} onPropChange={onPropChange} className="font-semibold text-gray-900" barWidth="w-32" />
                <Tx value={props[rk]} fieldKey={rk} placeholder={rph} editing={editing} onPropChange={onPropChange} className="text-sm text-[#2563EB]" barWidth="w-28" />
                <div className="space-y-1 pt-1">
                  <Ph w="w-full" h="h-2.5" />
                  <Ph w="w-4/5" h="h-2.5" />
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {[...Array(3)].map((_, j) => <div key={j} className="w-7 h-7 bg-gray-100 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

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
