'use client'

import { motion } from 'framer-motion'

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Délai en secondes (pour échelonner une grille : index * 0.06) */
  delay?: number
  /** Décalage vertical de départ, en px */
  y?: number
}

/** Apparition douce au défilement, jouée une seule fois. */
export default function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
