import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import NewHeader from '../../components/NewHeader'
import NewFooter from '../../components/NewFooter'

export const metadata: Metadata = {
  title: 'Agentics pour les établissements',
  description:
    'Des quiz de révision alignés sur votre catalogue de formations, et les cours terminés remontés dans votre logiciel de gestion.',
}

const CONTACT = 'mailto:contact@agentics.fr?subject=Demande%20de%20d%C3%A9monstration%20Agentics'

// Formations réellement en ligne dans le catalogue (/subjects)
const programmes = ['BTS CIEL', 'BTS SIO', 'BTS MCO', 'BTS SP3S', 'DevOps']

const steps = [
  {
    title: 'Votre catalogue, tel qu’il est',
    body: 'Formations, matières, semestres, coefficients et chapitres sont repris depuis votre logiciel de gestion. Vos étudiants retrouvent leur programme, pas un programme générique.',
    detail: 'Aujourd’hui : synchronisation avec QualiSoft (Odoo).',
  },
  {
    title: 'Vos cours deviennent des quiz',
    body: 'Vous déposez vos supports de cours en PDF. Agentics en extrait le contenu, le range par chapitre et prépare les quiz correspondants.',
    detail: 'Vous choisissez les cours qui sont publiés.',
  },
  {
    title: 'Les résultats reviennent chez vous',
    body: 'Quand un étudiant termine un cours avec le score requis, l’information remonte dans votre logiciel de gestion, sans ressaisie.',
    detail: 'Par API quand elle est disponible, sinon par export CSV quotidien.',
  },
]

export default function EcolesPage() {
  return (
    <>
      <NewHeader />
      <main id="contenu" className="min-h-screen bg-paper">
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-36 lg:pb-20 lg:pt-40">
          <p className="animate-slide-up text-sm font-semibold uppercase tracking-wider text-violet-700">
            Pour les établissements
          </p>
          <h1
            style={{ animationDelay: '60ms' }}
            className="animate-slide-up mt-4 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl"
          >
            La révision de vos étudiants, alignée sur votre programme
          </h1>
          <p
            style={{ animationDelay: '120ms' }}
            className="animate-slide-up mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft"
          >
            Agentics se branche sur votre catalogue de formations, transforme vos cours en quiz et vous renvoie ce que
            chaque étudiant a terminé.
          </p>
          <div
            style={{ animationDelay: '180ms' }}
            className="animate-slide-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href={CONTACT} className="btn-premium w-full sm:w-auto">
              <Mail className="h-5 w-5" aria-hidden="true" />
              Demander une démonstration
            </a>
            <Link
              href="/quiz/guest"
              className="inline-flex min-h-[44px] items-center rounded-lg px-2 font-semibold text-ink underline decoration-ink/25 decoration-2 underline-offset-4 transition-colors hover:decoration-violet-600"
            >
              Voir ce que voient les étudiants
            </Link>
          </div>
        </section>

        <section className="bg-white">
          <ol className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
            {steps.map((s, i) => (
              <li key={s.title} className="border-b border-ink/10 py-10 first:pt-0 last:border-0 last:pb-0">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[4rem_1fr] sm:gap-6">
                  <span className="font-display text-4xl font-bold tabular-nums text-violet-300" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{s.title}</h2>
                    <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{s.body}</p>
                    <p className="mt-3 text-sm font-semibold text-ink-muted">{s.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Déjà en ligne</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Ces formations sont chargées avec leurs matières et leurs chapitres. Le catalogue est consultable sans
              compte.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {programmes.map((p) => (
                <li key={p} className="rounded-full border border-ink/10 bg-white px-4 py-2 font-semibold text-ink">
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/subjects"
              className="group mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold text-violet-700"
            >
              Parcourir le catalogue
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-violet-700 px-6 py-10 text-center sm:px-10 sm:py-14">
              <h2 className="font-display text-3xl font-bold leading-tight text-white">
                Parlons de votre établissement
              </h2>
              <p className="mx-auto mt-3 max-w-lg leading-relaxed text-violet-100">
                Dites-nous quelles formations vous proposez et quel logiciel de gestion vous utilisez. Nous vous
                montrons Agentics avec votre propre programme.
              </p>
              <a href={CONTACT} className="btn-gold mt-8">
                <Mail className="h-5 w-5" aria-hidden="true" />
                contact@agentics.fr
              </a>
            </div>
          </div>
        </section>
      </main>
      <NewFooter />
    </>
  )
}
