'use client'

import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/Button'

export default function AuthButtons() {
  const { isSignedIn, user, isLoaded } = useUser()

  // Handle Clerk loading state
  if (!isLoaded) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 w-full sm:w-auto">
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Button href="/dashboard" variant="primary" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          Tableau de bord
        </Button>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
              userButtonBox: "shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 w-full sm:w-auto">
      <SignInButton mode="modal">
        <Button 
          variant="secondary"
          className="w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-primary-600 hover:bg-primary-50 px-3 sm:px-4 lg:px-6"
        >
          Se connecter
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button 
          variant="primary"
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 px-3 sm:px-4 lg:px-6"
        >
          S'inscrire
        </Button>
      </SignUpButton>
    </div>
  )
}
