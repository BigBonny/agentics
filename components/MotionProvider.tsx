'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Réglages de mouvement partagés par tout le site.
 * `reducedMotion="user"` : si l'OS demande moins d'animations, framer-motion
 * supprime les déplacements/zooms et ne garde que les fondus.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  )
}
