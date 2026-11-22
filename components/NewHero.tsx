import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HeroQuiz from './HeroQuiz'

// Formations réellement en ligne dans le catalogue (/subjects)
const programmes = ['BTS CIEL', 'BTS SIO', 'BTS MCO', 'BTS SP3S']

// Entrée en CSS pur : le texte rendu côté serveur s'affiche sans attendre le JavaScript.
const enter = (ms: number) => ({ animationDelay: `${ms}ms` })

export default function NewHero() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:pb-24 lg:pt-40">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Une idée : essayez. Deux portes : étudiant, établissement. */}
          <div className="text-center lg:text-left">
            <h1
              style={enter(0)}
              className="animate-slide-up font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Révisez votre BTS, une question à la fois
            </h1>

            <p
              style={enter(80)}
              className="animate-slide-up mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-soft lg:mx-0"
            >
              Répondez, voyez ce que vous maîtrisez, et revoyez seulement ce qui manque.
            </p>

            <div
              style={enter(160)}
              className="animate-slide-up mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href="/quiz/guest" className="btn-premium group w-full sm:w-auto">
                Commencer un quiz gratuit
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/ecoles"
                className="inline-flex min-h-[44px] items-center rounded-lg px-2 font-semibold text-ink underline decoration-ink/25 decoration-2 underline-offset-4 transition-colors hover:decoration-violet-600"
              >
                Je représente un établissement
              </Link>
            </div>

            <p style={enter(240)} className="animate-slide-up mt-8 text-sm text-ink-muted">
              Programmes en ligne : {programmes.join(' · ')}.{' '}
              <Link href="/subjects" className="font-semibold text-violet-700 underline-offset-4 hover:underline">
                Voir le programme
              </Link>
            </p>
          </div>

          <div style={enter(120)} className="animate-slide-up mx-auto w-full max-w-lg lg:max-w-none">
            <HeroQuiz />
          </div>
        </div>
      </div>
    </section>
  )
}
