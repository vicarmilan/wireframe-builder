'use client'

import { useState } from 'react'
import { X, ArrowRight, MessageSquare, MousePointer, Layers, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    id: 'wireframe',
    icon: Layers,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
    title: 'Dit is een wireframe',
    body: 'Een wireframe is een schematische schets van je website. De grijze blokken stellen tekst, afbeeldingen en knoppen voor — maar dan nog zonder echte kleuren, foto\'s of lettertypes.',
    visual: <WireframeVisual />,
    tip: null,
  },
  {
    id: 'not-design',
    icon: CheckCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Geen eindontwerp, wel de structuur',
    body: 'Bekijk het wireframe als een plattegrond van je website. Het gaat erom of de structuur en indeling kloppen — niet of het er mooi uitziet. Het echte design volgt later.',
    visual: <CompareVisual />,
    tip: 'Focus op: staat alles op de juiste plek? Ontbreekt er iets? Klopt de volgorde?',
  },
  {
    id: 'feedback',
    icon: MessageSquare,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Zo geef je feedback',
    body: 'Beweeg je muis over een sectie. Rechtsboven verschijnt een knopje. Klik erop om feedback te schrijven op precies dat onderdeel.',
    visual: <FeedbackVisual />,
    tip: null,
  },
  {
    id: 'ready',
    icon: MousePointer,
    iconBg: 'bg-[#2563EB]',
    iconColor: 'text-white',
    title: 'Klaar om te starten!',
    body: 'Scroll door de pagina\'s, bekijk de structuur en laat je reacties achter. Je feedback komt rechtstreeks bij ons terecht.',
    visual: <ReadyVisual />,
    tip: 'Tip: je kan op elke sectie afzonderlijk feedback geven.',
  },
]

function WireframeVisual() {
  return (
    <div className="relative">
      {/* Side-by-side: wireframe vs real */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 text-center">Wireframe</div>
          <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 space-y-2">
            {/* Nav */}
            <div className="flex items-center justify-between">
              <div className="w-14 h-2.5 bg-gray-300 rounded" />
              <div className="flex gap-1.5">
                <div className="w-7 h-2 bg-gray-300 rounded" />
                <div className="w-7 h-2 bg-gray-300 rounded" />
                <div className="w-10 h-5 bg-blue-200 rounded" />
              </div>
            </div>
            {/* Hero */}
            <div className="space-y-1.5 py-2 text-center">
              <div className="w-3/4 h-3 bg-gray-300 rounded mx-auto" />
              <div className="w-1/2 h-2 bg-gray-200 rounded mx-auto" />
              <div className="w-16 h-5 bg-blue-200 rounded mx-auto mt-1" />
            </div>
          </div>
          <div className="text-[9px] text-gray-400 text-center">Grijze blokken = inhoud</div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 text-center">Echt ontwerp</div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-3 border border-blue-300 space-y-2">
            {/* Nav */}
            <div className="flex items-center justify-between">
              <div className="text-white font-bold text-[8px]">LOGO</div>
              <div className="flex gap-1.5">
                <div className="text-blue-200 text-[7px]">Home</div>
                <div className="text-blue-200 text-[7px]">Over</div>
                <div className="bg-white text-blue-700 text-[7px] px-1.5 py-0.5 rounded font-semibold">Start</div>
              </div>
            </div>
            {/* Hero */}
            <div className="space-y-1.5 py-2 text-center">
              <div className="text-white font-bold text-[9px] leading-tight">Wij bouwen<br/>top websites</div>
              <div className="text-blue-200 text-[7px]">Neem contact op</div>
              <div className="bg-white text-blue-700 text-[7px] px-2 py-0.5 rounded inline-block mt-0.5 font-semibold">Aan de slag</div>
            </div>
          </div>
          <div className="text-[9px] text-gray-400 text-center">Echte kleuren & tekst</div>
        </div>
      </div>
    </div>
  )
}

function CompareVisual() {
  const checks = [
    { label: 'Is alle content aanwezig?', ok: true },
    { label: 'Is er een duidelijke call-to-action?', ok: true },
    { label: 'Ontbreekt er een contactpagina?', ok: false },
  ]
  const skips = [
    'Lettertype keuze',
    'Kleurenpalet',
    'Foto\'s & illustraties',
  ]
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="bg-green-50 rounded-xl p-3 border border-green-100 space-y-2">
        <div className="font-semibold text-green-700 flex items-center gap-1.5">
          <CheckCircle size={12} />
          Beoordeel wel
        </div>
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${c.ok ? 'bg-green-500' : 'bg-red-400'}`}>
              <span className="text-white text-[8px]">{c.ok ? '✓' : '!'}</span>
            </div>
            <span className="text-gray-600 leading-tight">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
        <div className="font-semibold text-gray-500 flex items-center gap-1.5">
          <X size={12} />
          Nog niet
        </div>
        {skips.map((s, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mt-0.5">
              <span className="text-gray-400 text-[8px]">—</span>
            </div>
            <span className="text-gray-400 leading-tight">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeedbackVisual() {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="space-y-2">
      {/* Simulated component with hover state */}
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 cursor-default select-none overflow-hidden ${hovered ? 'border-blue-300 shadow-md' : 'border-gray-200'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Fake wireframe section */}
        <div className="bg-white p-4 space-y-2">
          <div className="flex gap-4 items-center">
            <div className="space-y-1.5 flex-1">
              <div className="w-3/4 h-3.5 bg-gray-200 rounded" />
              <div className="w-full h-2.5 bg-gray-100 rounded" />
              <div className="w-5/6 h-2.5 bg-gray-100 rounded" />
              <div className="w-24 h-6 bg-blue-100 rounded mt-2" />
            </div>
            <div className="w-24 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
          </div>
        </div>

        {/* Feedback button appears on hover */}
        <div className={`absolute top-2 right-2 transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
          <div className="bg-white border border-blue-300 shadow-lg rounded-lg px-2.5 py-1.5 text-[11px] text-blue-600 flex items-center gap-1.5 font-medium">
            <MessageSquare size={11} />
            Feedback geven
          </div>
        </div>

        {/* Hover label */}
        {hovered && (
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none rounded-xl" />
        )}
      </div>
      <p className="text-[11px] text-gray-400 text-center">Beweeg je muis over de sectie hierboven om het te zien</p>
    </div>
  )
}

function ReadyVisual() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex gap-2">
        {[
          { color: 'bg-blue-100', label: 'Navigatie' },
          { color: 'bg-purple-100', label: 'Hero' },
          { color: 'bg-green-100', label: 'Features' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-lg px-3 py-2 text-center min-w-[72px]`}>
            <div className="w-12 h-2 bg-white/60 rounded mb-1.5 mx-auto" />
            <div className="w-8 h-1.5 bg-white/40 rounded mx-auto" />
            <div className="text-[9px] font-medium text-gray-500 mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
          <MessageSquare size={10} className="text-white" />
        </div>
        Klik op elke sectie voor gerichte feedback
      </div>
    </div>
  )
}

interface Props {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  function handleNext() {
    if (isLast) {
      onClose()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#2563EB] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-xl ${current.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={current.iconColor} />
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500 transition-colors p-1"
              title="Overslaan"
            >
              <X size={16} />
            </button>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">{current.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{current.body}</p>
          </div>

          {/* Visual */}
          <div className="bg-gray-50 rounded-xl p-4">
            {current.visual}
          </div>

          {/* Tip */}
          {current.tip && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">💡</span>
              <p className="text-xs text-amber-700 leading-relaxed">{current.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-5 h-2 bg-[#2563EB]'
                    : i < step
                    ? 'w-2 h-2 bg-blue-200'
                    : 'w-2 h-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {isLast ? 'Aan de slag' : 'Volgende'}
            {!isLast && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
