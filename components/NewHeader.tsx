'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Tag,
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { useUser, SignOutButton } from '@clerk/nextjs'

type NavLink = { name: string; href: string; icon: LucideIcon }

const baseLinks: NavLink[] = [
  { name: 'Programme', href: '/subjects', icon: GraduationCap },
  { name: 'Cours', href: '/courses', icon: BookOpen },
  { name: 'Tarifs', href: '/pricing', icon: Tag },
  { name: 'Établissements', href: '/ecoles', icon: Building2 },
]

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function NewHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn } = useUser()
  const pathname = usePathname()

  const navLinks: NavLink[] = isSignedIn
    ? [...baseLinks, { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard }]
    : baseLinks

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Le menu se referme à chaque changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Menu mobile ouvert : on bloque le défilement de la page et Échap ferme
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-violet-700 focus:shadow-lift"
      >
        Aller au contenu
      </a>

      <header
        className="animate-fade-in fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div
          className={`mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl border pl-4 pr-2.5 transition-[background-color,box-shadow,border-color] duration-300 sm:pl-5 ${
            isScrolled
              ? 'border-ink/10 bg-white/95 shadow-soft backdrop-blur-xl'
              : 'border-transparent bg-white/70 backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="Agentics — accueil">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-[0_3px_0_#4c1d95] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
              <Sparkles className="h-[18px] w-[18px] text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">Agentics</span>
          </Link>

          {/* Navigation bureau */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-colors duration-200 ${
                    active ? 'text-violet-700' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-violet-100"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Actions bureau */}
          <div className="hidden items-center gap-2 lg:flex">
            {isSignedIn ? (
              <>
                <Link href="/account" className="btn-primary !px-4 !py-2 text-[15px]">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Mon compte
                </Link>
                <SignOutButton>
                  <button
                    type="button"
                    aria-label="Déconnexion"
                    title="Déconnexion"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                  </button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  Connexion
                </Link>
                <Link href="/quiz/guest" className="btn-primary !px-4 !py-2 text-[15px]">
                  Quiz gratuit
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="menu-mobile"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink transition-colors hover:bg-ink/5 lg:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMobileMenuOpen ? 'close' : 'open'}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Menu mobile : feuille qui descend sous la barre */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              id="menu-mobile"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed inset-x-3 top-[5.25rem] z-50 max-h-[calc(100dvh-6.25rem)] origin-top overflow-y-auto overscroll-contain rounded-3xl border border-ink/10 bg-white p-3 shadow-lift sm:inset-x-5 lg:hidden"
            >
              <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
                {navLinks.map((link, index) => {
                  const active = isActive(pathname, link.href)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex min-h-[52px] items-center gap-3 rounded-2xl px-3 text-base font-semibold transition-colors active:bg-violet-100 ${
                          active ? 'bg-violet-100 text-violet-800' : 'text-ink hover:bg-ink/5'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            active ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-700'
                          }`}
                        >
                          <link.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              <div className="mt-3 flex flex-col gap-2.5 border-t border-ink/10 px-1 pb-2 pt-4">
                {isSignedIn ? (
                  <>
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full">
                      <User className="h-5 w-5" aria-hidden="true" />
                      Mon compte
                    </Link>
                    <SignOutButton>
                      <button
                        type="button"
                        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" aria-hidden="true" />
                        Déconnexion
                      </button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Link href="/quiz/guest" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full">
                      Quiz gratuit
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                    <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="btn-ghost w-full">
                      Connexion
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
