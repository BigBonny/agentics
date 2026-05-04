import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  const navigation = {
    produit: [
      { name: 'Fonctionnalités', href: '#features' },
      { name: 'Architecture', href: '#architecture' },
      { name: 'Tarifs', href: '#pricing' },
      { name: 'Démo', href: '#contact' }
    ],
    entreprise: [
      { name: 'À propos', href: '#about' },
      { name: 'Carrières', href: '#careers' },
      { name: 'Presse', href: '#press' },
      { name: 'Blog', href: '#blog' }
    ],
    support: [
      { name: 'Centre d\'aide', href: '#help' },
      { name: 'Documentation', href: '#docs' },
      { name: 'Contact', href: '#contact' },
      { name: 'Statut', href: '#status' }
    ],
    legal: [
      { name: 'Mentions légales', href: '#legal' },
      { name: 'Confidentialité', href: '#privacy' },
      { name: 'CGU', href: '#terms' },
      { name: 'Cookies', href: '#cookies' }
    ]
  }

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: '#facebook' },
    { icon: <Twitter className="h-5 w-5" />, href: '#twitter' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#linkedin' },
    { icon: <Instagram className="h-5 w-5" />, href: '#instagram' }
  ]

  return (
    <footer className="bg-gray-900 text-white pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-primary-400 mr-2" />
              <span className="text-xl font-bold">Agentics Révision</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              La plateforme d'apprentissage personnalisé qui utilise l'intelligence 
              artificielle pour vous aider à réussir vos examens nationaux.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2 text-primary-400" />
                <span>contact@agentics-revision.fr</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2 text-primary-400" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                <span>123 Avenue de l'Innovation, Paris</span>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-gray-800 rounded-full p-2 hover:bg-primary-600 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produit</h3>
            <ul className="space-y-2">
              {navigation.produit.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {navigation.entreprise.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Agentics Révision. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              {navigation.legal.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
