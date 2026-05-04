'use client'

import { motion } from 'framer-motion'
import { Sparkles, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Crown, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const footerLinks = {
  product: [
    { name: 'Quiz Gratuit', href: '/quiz/guest' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'Fonctionnalités', href: '/#features' },
    { name: 'Tableau de Bord', href: '/dashboard' }
  ],
  company: [
    { name: 'À Propos', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Carrières', href: '#' },
    { name: 'Contact', href: '#' }
  ],
  resources: [
    { name: 'Centre d\'aide', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Mentions légales', href: '#' },
    { name: 'Confidentialité', href: '#' }
  ],
  social: [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ]
}

export default function NewFooter() {
  const router = useRouter()

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Rejoignez <span className="gradient-text-gold">10,000+ étudiants</span>
              </h3>
              <p className="text-gray-400 text-lg">
                Inscrivez-vous pour recevoir des conseils d'étude, des offres exclusives et des mises à jour sur nos nouvelles fonctionnalités.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pricing')}
                className="btn-gold flex items-center justify-center gap-2 px-8"
              >
                <span>S'inscrire</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Agentics</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              La plateforme d'apprentissage alimentée par l'IA qui aide les étudiants à exceller dans leurs examens.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Produit</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Ressources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-violet-400" />
                <span>contact@agentics.fr</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-violet-400" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 text-violet-400 mt-0.5" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Agentics. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button className="text-gray-500 hover:text-violet-400 transition-colors">
                Mentions légales
              </button>
              <button className="text-gray-500 hover:text-violet-400 transition-colors">
                Politique de confidentialité
              </button>
              <button className="text-gray-500 hover:text-violet-400 transition-colors">
                CGU
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
