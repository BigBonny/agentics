import Link from 'next/link'
import { Sparkles, Mail, MapPin, ArrowRight } from 'lucide-react'

const columns = [
  {
    title: 'Produit',
    links: [
      { name: 'Quiz gratuit', href: '/quiz/guest' },
      { name: 'Programme', href: '/subjects' },
      { name: 'Cours', href: '/courses' },
      { name: 'Tarifs', href: '/pricing' },
      { name: 'Établissements', href: '/ecoles' },
    ],
  },
  {
    title: 'Mon espace',
    links: [
      { name: 'Tableau de bord', href: '/dashboard' },
      { name: 'Mon compte', href: '/account' },
      { name: 'Connexion', href: '/sign-in' },
    ],
  },
]

const linkClass =
  'inline-flex min-h-[32px] items-center text-gray-400 transition-colors duration-200 hover:text-white'

export default function NewFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          {/* Marque */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-xl" aria-label="Agentics — accueil">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-[0_3px_0_#4c1d95]">
                <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight">Agentics</span>
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-gray-400">
              Des quiz de révision alignés sur le programme de votre BTS.
            </p>
            <Link
              href="/quiz/guest"
              className="group mt-6 inline-flex items-center gap-2 font-semibold text-violet-300 transition-colors hover:text-white"
            >
              Commencer un quiz gratuit
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-gray-300">{col.title}</h2>
              <ul className="mt-4 space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-gray-300">Contact</h2>
            <ul className="mt-4 space-y-3 text-gray-400">
              <li>
                <a href="mailto:contact@agentics.fr" className={`${linkClass} gap-3`}>
                  <Mail className="h-5 w-5 shrink-0 text-violet-400" aria-hidden="true" />
                  contact@agentics.fr
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-violet-400" aria-hidden="true" />
                Paris, France
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-400 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Agentics. Tous droits réservés.</p>
          
        </div>
      </div>
    </footer>
  )
}
