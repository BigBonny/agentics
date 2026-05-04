'use client'

import { SignUp } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowLeft, Crown, Star, Zap } from 'lucide-react'

export default function Page() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && user) {
        console.log('🔔 User signed up, syncing with database...')
        
        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerk_id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress || '',
              first_name: user.firstName || '',
              last_name: user.lastName || ''
            })
          })

          if (response.ok) {
            console.log('✅ User synced with database successfully')
          } else {
            console.error('❌ Failed to sync user with database')
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }

        router.push('/pricing')
      }
    }

    syncUser()
  }, [isLoaded, isSignedIn, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative">
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors z-50 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Retour</span>
      </Link>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Benefits (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 items-center justify-center p-12">
          <div className="max-w-md text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Agentics</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez plus de 10,000 étudiants qui réussissent
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Créez votre compte gratuit et accédez immédiatement à nos quizzes intelligents et recommandations personnalisées.
            </p>

            <div className="space-y-4">
              {[
                { icon: Star, text: 'Essai gratuit de 30 jours' },
                { icon: Zap, text: 'Accès immédiat aux quizzes' },
                { icon: Crown, text: 'Recommandations personnalisées' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Agentics</span>
          </div>

          <div className="w-full max-w-md">
            <SignUp
              appearance={{
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: true,
                },
                variables: {
                  colorPrimary: '#7c3aed',
                  colorText: '#1f2937',
                  colorTextSecondary: '#6b7280',
                  colorBackground: '#ffffff',
                  colorInputBackground: '#f9fafb',
                  colorInputText: '#1f2937',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-white shadow-2xl rounded-3xl border border-gray-100 p-8',
                  headerTitle: 'text-2xl font-bold text-gray-900 text-center',
                  headerSubtitle: 'text-gray-600 text-center mt-2',
                  socialButtonsBlockButton: 'w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-medium hover:border-violet-400 hover:bg-violet-50 transition-all',
                  formFieldLabel: 'text-gray-700 font-medium text-sm',
                  formFieldInput: 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                  formButtonPrimary: 'w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all mt-4',
                  footerActionText: 'text-gray-600 text-center text-sm',
                  footerActionLink: 'text-violet-600 font-semibold hover:text-violet-700',
                  identityPreviewEditButton: 'text-violet-600 font-medium hover:text-violet-700',
                  formFieldErrorText: 'text-red-500 text-sm mt-1',
                  alertText: 'text-red-600 text-sm',
                  otpInputBox: 'w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500 mx-0.5',
                }
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/pricing"
            />
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-sm mt-6 max-w-md">
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="text-violet-600 hover:text-violet-700 font-medium">
              Conditions d'utilisation
            </Link>{' '}
            et{' '}
            <Link href="#" className="text-violet-600 hover:text-violet-700 font-medium">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
