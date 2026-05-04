import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative">
      {/* Back Button - Fixed position with high z-index */}
      <Link
        href="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors z-50 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Retour</span>
      </Link>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Agentics</span>
        </div>

        {/* Clerk SignIn - Minimal styling */}
        <div className="w-full max-w-md">
          <SignIn
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
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-6 max-w-md">
          En vous connectant, vous acceptez nos{' '}
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
  )
}
