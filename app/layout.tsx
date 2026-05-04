import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agentics Révision - Plateforme d\'Apprentissage Personnalisé',
  description: 'Surmontez vos lacunes académiques et réussissez vos examens nationaux avec notre IA adaptative',
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
        <body className={inter.className} suppressHydrationWarning={true}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
