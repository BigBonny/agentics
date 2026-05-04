'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, Crown, LogOut, User, Home, Target, CreditCard, ChevronRight, Zap, Flame, Award } from 'lucide-react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'

// Pages with light backgrounds that need dark header text
const lightBgPages = ['/dashboard', '/pricing', '/quiz', '/quiz/guest', '/courses', '/sign-up', '/sign-in']

export default function NewHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  // Check if current page has light background
  const isLightBgPage = lightBgPages.some(page => pathname?.startsWith(page))
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Determine if we should use dark text
  const useDarkText = isScrolled || isLightBgPage

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Quiz Gratuit', href: '/quiz/guest' },
    { name: 'Tarifs', href: '/pricing' },
    ...(isSignedIn ? [{ name: 'Tableau de Bord', href: '/dashboard' }] : [])
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isLightBgPage
            ? 'bg-white/95 backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${useDarkText ? 'text-gray-900' : 'text-white'}`}>
                Agentics
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => router.push(link.href)}
                  className={`font-medium transition-colors ${
                    useDarkText
                      ? 'text-gray-700 hover:text-violet-600'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/account')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Mon Compte
                  </button>
                  <SignOutButton>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        useDarkText
                          ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                          : 'text-white/80 hover:text-red-400'
                      }`}
                      title="Déconnexion"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/sign-in')}
                    className={`font-medium transition-colors ${
                      useDarkText
                        ? 'text-gray-700 hover:text-violet-600'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="btn-premium flex items-center gap-2 py-2.5 px-6 text-base"
                  >
                    <Crown className="h-4 w-4" />
                    Essai Gratuit
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                useDarkText ? 'text-gray-900' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Ultra Cool Design */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%', scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: '100%', scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm z-50 md:hidden"
            >
              <div className="h-full bg-gradient-to-br from-white via-violet-50/30 to-purple-50/50 backdrop-blur-xl shadow-2xl border-l border-white/50 overflow-hidden flex flex-col">
                {/* Menu Header */}
                <div className="p-6 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold text-lg">Menu</span>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {isSignedIn && (
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <p className="font-semibold">Mon Compte</p>
                        <p className="text-white/70 text-sm">Premium Member</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navLinks.map((link, index) => {
                    const icons: Record<string, React.ReactNode> = {
                      'Accueil': <Home className="w-5 h-5" />,
                      'Quiz Gratuit': <Target className="w-5 h-5" />,
                      'Tarifs': <CreditCard className="w-5 h-5" />,
                      'Tableau de Bord': <Zap className="w-5 h-5" />
                    }
                    
                    return (
                      <motion.button
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          router.push(link.href)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full group relative overflow-hidden"
                      >
                        <div className="relative flex items-center gap-4 py-4 px-5 text-gray-700 font-medium rounded-2xl transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-lg">
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 group-hover:from-white/20 group-hover:to-white/10 group-hover:text-white transition-all duration-300">
                            {icons[link.name] || <Sparkles className="w-5 h-5" />}
                          </span>
                          <span className="flex-1 text-left">{link.name}</span>
                          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                      </motion.button>
                    )
                  })}

                  {/* Divider */}
                  <div className="my-4 mx-4 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />

                  {/* Action Buttons */}
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => {
                          router.push('/account')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full relative overflow-hidden group"
                      >
                        <div className="relative flex items-center gap-4 py-4 px-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300">
                          <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                          </span>
                          <span className="flex-1 text-left">Mon Compte</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.button>

                      <SignOutButton>
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="w-full flex items-center gap-4 py-4 px-5 text-red-500 font-medium rounded-2xl border border-red-200 hover:bg-red-50 transition-all duration-300"
                        >
                          <span className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
                            <LogOut className="w-5 h-5" />
                          </span>
                          <span className="flex-1 text-left">Déconnexion</span>
                        </motion.button>
                      </SignOutButton>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => {
                          router.push('/sign-in')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full group"
                      >
                        <div className="flex items-center gap-4 py-4 px-5 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition-all duration-300">
                          <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-200 transition-colors">
                            <User className="w-5 h-5" />
                          </span>
                          <span className="flex-1 text-left">Connexion</span>
                        </div>
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        onClick={() => {
                          router.push('/pricing')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full relative overflow-hidden group"
                      >
                        <div className="relative flex items-center gap-4 py-4 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300">
                          <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Flame className="w-5 h-5" />
                          </span>
                          <span className="flex-1 text-left">Essai Gratuit</span>
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                      </motion.button>
                    </div>
                  )}
                </nav>

                {/* Footer */}
                <div className="p-4 bg-gradient-to-t from-violet-50/50 to-transparent">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span>Agentics Premium</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
