import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import MotionProvider from '../components/MotionProvider'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Agentics Révision - Plateforme d\'Apprentissage Personnalisé',
  description: 'Surmontez vos lacunes académiques et réussissez vos examens nationaux avec notre IA adaptative',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf9f4',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
          card: 'bg-white shadow-lg',
        }
      }}
    >
      <html lang="fr">
        <head>
          <script dangerouslySetInnerHTML={{
            __html: `
              // Prevent multiple GoTrueClient instances
              if (typeof window !== 'undefined') {
                window.GoTrueClient = window.GoTrueClient || (function() {
                  var instances = [];
                  return function() {
                    if (instances.length > 0) {
                      return instances[0];
                    }
                    var instance = function() {
                      // Your existing GoTrueClient code
                    };
                    instances.push(instance);
                    return instance;
                  };
                })();
              }
            `
          }} />
        </head>
        <body className={`${inter.variable} ${display.variable} font-sans`} suppressHydrationWarning={true}>
          <MotionProvider>{children}</MotionProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
