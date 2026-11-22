'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, Brain, RotateCcw, Trophy } from 'lucide-react'

type Question = {
  subject: string
  prompt: string
  options: string[]
  answer: number
  why: string
}

const questions: Question[] = [
  {
    subject: 'Mathématiques',
    prompt: 'Quelle est la dérivée de f(x) = 3x² + 2x − 1 ?',
    options: ['3x + 2', '6x + 2', '6x − 1', '6x² + 2'],
    answer: 1,
    why: 'On dérive terme à terme : (3x²)′ = 6x, (2x)′ = 2 et la constante disparaît.',
  },
  {
    subject: 'Physique',
    prompt: 'Dans quelle unité mesure-t-on une résistance électrique ?',
    options: ['Le volt', 'L’ampère', 'Le watt', 'L’ohm'],
    answer: 3,
    why: 'Loi d’Ohm : U = R × I, avec la résistance R exprimée en ohms (Ω).',
  },
  {
    subject: 'Réseaux',
    prompt: 'Combien de bits compte une adresse IPv4 ?',
    options: ['32 bits', '16 bits', '64 bits', '128 bits'],
    answer: 0,
    why: 'Une adresse IPv4 s’écrit sur 4 octets de 8 bits, soit 32 bits.',
  },
]

const letters = ['A', 'B', 'C', 'D']

/**
 * Mini-quiz jouable du hero : le visiteur essaie le produit avant même de s'inscrire.
 * Tout est local (aucun appel réseau), donc instantané sur mobile.
 */
export default function HeroQuiz() {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const done = step >= questions.length
  const q = questions[Math.min(step, questions.length - 1)]
  const answered = picked !== null
  const correct = answered && picked === q.answer

  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    setPicked(null)
    setStep((s) => s + 1)
  }

  const restart = () => {
    setPicked(null)
    setScore(0)
    setStep(0)
  }

  return (
    <div className="relative rounded-[28px] border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
      {/* En-tête */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 shadow-[0_3px_0_#4c1d95]">
            <Brain className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink">À vous de jouer</p>
            <p className="text-sm text-ink-muted">{done ? 'Terminé' : q.subject}</p>
          </div>
        </div>
        <div
          className="flex shrink-0 items-center gap-1.5"
          role="img"
          aria-label={done ? 'Quiz terminé' : `Question ${step + 1} sur ${questions.length}`}
        >
          {questions.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < step ? 'w-5 bg-mint' : i === step ? 'w-7 bg-violet-600' : 'w-5 bg-ink/10'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="py-4 text-center"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600 shadow-[0_4px_0_#4c1d95]"
            >
              <Trophy className="h-8 w-8 text-white" aria-hidden="true" />
            </motion.span>
            <p className="font-display text-3xl font-extrabold text-ink" aria-live="polite">
              {score}/{questions.length}
            </p>
            <p className="mx-auto mt-2 max-w-xs text-ink-soft">
              {score === questions.length
                ? 'Sans faute ! Voyons jusqu’où vous allez sur un quiz complet.'
                : 'Bon début. Un quiz complet repère précisément ce qu’il vous reste à revoir.'}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/quiz/guest" className="btn-primary">
                Continuer avec un quiz complet
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <button type="button" onClick={restart} className="btn-ghost">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Rejouer
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mb-4 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">{q.prompt}</h2>

            <div className="grid gap-2.5" role="group" aria-label="Réponses possibles">
              {q.options.map((option, i) => {
                const isAnswer = i === q.answer
                const isPicked = i === picked
                let tone = 'border-ink/10 bg-white text-ink shadow-[0_3px_0_rgba(23,19,43,0.08)] hover:border-violet-300 hover:bg-violet-50'
                if (answered && isAnswer) tone = 'border-mint bg-emerald-50 text-emerald-900 shadow-[0_3px_0_#12b76a]'
                else if (answered && isPicked) tone = 'border-coral bg-red-50 text-red-900 shadow-[0_3px_0_#ff6b57] animate-shake'
                else if (answered) tone = 'border-ink/10 bg-white text-ink-muted opacity-60'

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-left text-base font-semibold transition-[background-color,border-color,transform,opacity] duration-200 ${tone} ${
                      answered ? 'cursor-default' : 'cursor-pointer active:translate-y-[3px] active:shadow-none'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        answered && isAnswer
                          ? 'bg-mint text-white'
                          : answered && isPicked
                          ? 'bg-coral text-white'
                          : 'bg-ink/5 text-ink-soft'
                      }`}
                    >
                      {answered && isAnswer ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : answered && isPicked ? (
                        <X className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        letters[i]
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                    {answered && isAnswer && <span className="sr-only">— bonne réponse</span>}
                    {answered && isPicked && !isAnswer && <span className="sr-only">— votre réponse, incorrecte</span>}
                  </button>
                )
              })}
            </div>

            {/* Correction + suite : la hauteur est réservée pour éviter tout saut de mise en page */}
            <div className="mt-4 min-h-[124px] sm:min-h-[104px]" aria-live="polite">
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center ${
                    correct ? 'bg-emerald-50' : 'bg-amber-50'
                  }`}
                >
                  <p className={`flex-1 text-sm leading-relaxed ${correct ? 'text-emerald-900' : 'text-amber-900'}`}>
                    <strong className="font-bold">{correct ? 'Exact ! ' : 'Pas tout à fait. '}</strong>
                    {q.why}
                  </p>
                  <button type="button" onClick={next} className="btn-primary shrink-0 !px-4 !py-2.5 text-[15px]">
                    {step === questions.length - 1 ? 'Voir mon score' : 'Suivante'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
