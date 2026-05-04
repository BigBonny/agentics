'use client'

import { useState } from 'react'
import { Button } from './ui/Button'

export default function MockAuthButtons() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [showModal, setShowModal] = useState(false)

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Button href="/dashboard" variant="primary" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          Tableau de bord
        </Button>
        <Button 
          onClick={() => {
            setIsSignedIn(false)
            setHasSubscription(false)
          }}
          variant="secondary"
          className="shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Se déconnecter
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 w-full sm:w-auto">
      <Button 
        onClick={() => {
          setShowModal(true)
          setTimeout(() => {
            setIsSignedIn(true)
            setHasSubscription(true) // Auto-grant subscription for testing
            setShowModal(false)
          }, 1500)
        }}
        variant="secondary"
        className="w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-primary-600 hover:bg-primary-50 px-3 sm:px-4 lg:px-6"
      >
        Se connecter
      </Button>
      <Button 
        onClick={() => {
          setShowModal(true)
          setTimeout(() => {
            setIsSignedIn(true)
            setHasSubscription(true) // Auto-grant subscription for testing
            setShowModal(false)
          }, 1500)
        }}
        variant="primary"
        className="w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 px-3 sm:px-4 lg:px-6"
      >
        S'inscrire
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-100 animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connexion en cours...</h3>
              <p className="text-gray-600 mb-4">
                Création de votre compte premium avec accès instantané
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export function to check subscription status
export const useMockSubscription = () => {
  const [hasSubscription, setHasSubscription] = useState(true) // Default to true for testing
  
  return { hasSubscription }
}
