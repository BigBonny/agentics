'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Reveal from './ui/Reveal'

/** Deux portes de sortie, comme en haut de page : l'étudiant et l'établissement. */
export default function FinalCTA() {
  return (
    <section className="bg-paper px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col items-start rounded-3xl bg-violet-700 p-8 sm:p-10">
            <h2 className="font-display text-3xl font-bold leading-tight text-white">Prêt à vous tester ?</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-violet-100">
              Un premier quiz, sans inscription. Vous saurez où vous en êtes en quelques minutes.
            </p>
            <Link href="/quiz/guest" className="btn-gold group mt-8">
              Commencer un quiz gratuit
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col items-start rounded-3xl border border-ink/10 bg-white p-8 sm:p-10">
            <h2 className="font-display text-3xl font-bold leading-tight text-ink">Vous dirigez un établissement ?</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-ink-soft">
              Agentics reprend votre catalogue de formations et renvoie les cours terminés dans votre logiciel de
              gestion.
            </p>
            <Link href="/ecoles" className="btn-ghost group mt-8">
              Voir l’offre établissements
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
