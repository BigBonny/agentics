'use client'

import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'
import Reveal from './ui/Reveal'

/**
 * Trois sections pleine largeur : une idée, deux phrases, un visuel.
 * Les visuels reproduisent l'interface avec un contenu d'exemple (étiqueté comme tel).
 * À remplacer par de vraies captures d'écran dès qu'elles sont disponibles.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl bg-paper-deep p-5 sm:p-8">
      <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-muted">
        Exemple
      </span>
      {children}
    </div>
  )
}

function LevelVisual() {
  const levels = ['Débutant', 'Intermédiaire', 'Avancé']
  return (
    <Frame>
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-ink-muted">Mathématiques · Question 4</p>
        <p className="mt-2 font-display text-lg font-bold text-ink">Résoudre : 2x + 6 = 0</p>
        <div className="mt-5 flex gap-2">
          {levels.map((l, i) => (
            <span
              key={l}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold ${
                i === 1 ? 'bg-violet-600 text-white' : 'bg-ink/5 text-ink-muted'
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function CorrectionVisual() {
  return (
    <Frame>
      <div className="mx-auto max-w-sm space-y-2.5 rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3 rounded-xl border-2 border-coral bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-coral text-white">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Le volt
        </div>
        <div className="flex items-center gap-3 rounded-xl border-2 border-mint bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-mint text-white">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          L’ohm
        </div>
        <p className="rounded-xl bg-paper px-3 py-3 text-sm leading-relaxed text-ink-soft">
          <strong className="font-semibold text-ink">Pourquoi : </strong>
          loi d’Ohm, U = R × I, avec la résistance R en ohms (Ω).
        </p>
      </div>
    </Frame>
  )
}

function ChaptersVisual() {
  const rows = [
    { name: 'Dérivées', state: 'Acquis', todo: false },
    { name: 'Probabilités', state: 'À revoir en premier', todo: true },
    { name: 'Suites', state: 'À consolider', todo: true },
  ]
  return (
    <Frame>
      <ul className="mx-auto max-w-sm divide-y divide-ink/[0.07] rounded-2xl bg-white px-5 shadow-soft">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 py-3.5">
            <span className="font-semibold text-ink">{r.name}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                r.todo ? 'bg-violet-100 text-violet-800' : 'bg-ink/5 text-ink-muted'
              }`}
            >
              {r.state}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

const sections = [
  {
    title: 'Des questions à votre niveau',
    body: 'Les quiz suivent le programme de votre formation, matière par matière. Les questions s’adaptent à votre niveau au fil de vos réponses.',
    visual: <LevelVisual />,
  },
  {
    title: 'Une correction qui explique',
    body: 'Après chaque réponse, vous voyez la bonne réponse et la raison. Votre score arrive tout de suite, sans attendre.',
    visual: <CorrectionVisual />,
  },
  {
    title: 'Vos points faibles, repérés',
    body: 'Agentics repère les chapitres où vous perdez des points et vous dit quoi revoir en premier.',
    note: 'Inclus dans Premium',
    visual: <ChaptersVisual />,
  },
]

export default function FeatureSections() {
  return (
    <div className="bg-white">
      {sections.map((s, i) => (
        <section key={s.title} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <Reveal className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{s.title}</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{s.body}</p>
              {s.note && <p className="mt-4 text-sm font-semibold text-violet-700">{s.note}</p>}
            </Reveal>
            <Reveal delay={0.08}>{s.visual}</Reveal>
          </div>
        </section>
      ))}

      {/* Premium : une seule mention, à la fin */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-paper px-6 py-8 sm:px-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Gratuit pour commencer</h2>
              <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
                Le forfait Découverte suffit pour vous tester. Premium ajoute les quiz illimités, l’analyse de vos
                points faibles et le suivi de votre progression.
              </p>
            </div>
            <Link
              href="/pricing"
              className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 font-semibold text-violet-700"
            >
              Voir les tarifs
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
