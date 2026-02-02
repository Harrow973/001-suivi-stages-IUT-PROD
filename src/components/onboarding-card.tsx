'use client'

import { CardComponentProps } from 'nextstepjs'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

export function OnboardingCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const handleFinish = () => {
    // Marquer l'onboarding comme terminé dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('etudiants-onboarding-seen', 'true')
    }
    // Fermer l'onboarding
    if (skipTour) {
      skipTour()
    }
  }

  return (
    <Card className="w-[400px] max-w-[90vw] shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image
              src="/IUTMartiniquelogo.svg"
              alt="IUT de la Martinique"
              width={24}
              height={24}
              className="h-12 w-auto"
            />
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFinish}
            className="h-6 w-6"
            aria-label="Fermer l'onboarding"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Étape {currentStep + 1} sur {totalSteps}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">{step.content}</p>
        {arrow}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
        <div className="flex gap-2">
          <Button
            onClick={prevStep}
            disabled={isFirstStep}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <Button
            onClick={nextStep}
            disabled={isLastStep}
            size="sm"
            className="flex items-center gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {isLastStep ? (
          <Button
            onClick={handleFinish}
            size="sm"
            className="flex items-center gap-1"
          >
            Terminer
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Passer
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

