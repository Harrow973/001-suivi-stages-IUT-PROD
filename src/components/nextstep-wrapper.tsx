'use client'

import dynamic from 'next/dynamic'

// Charger NextStep uniquement côté client avec ssr: false
const NextStep = dynamic(
  () => import('nextstepjs').then((mod) => mod.NextStep),
  { 
    ssr: false,
    loading: () => null
  }
)

import { etudiantsOnboardingSteps } from '@/lib/onboarding-steps'
import { OnboardingCard } from '@/components/onboarding-card'

export function NextStepWrapper({ children }: { children: React.ReactNode }) {
  // Toujours retourner les children sans NextStep lors du SSR
  // NextStep sera chargé uniquement côté client grâce à ssr: false
  return (
    <NextStep steps={etudiantsOnboardingSteps} cardComponent={OnboardingCard}>
      {children}
    </NextStep>
  )
}

