'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, Building2, HelpCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useNextStep } from 'nextstepjs'

export default function EtudiantsDashboardPage() {
  const { startNextStep, isNextStepVisible } = useNextStep()
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'onboarding
    const checkOnboarding = () => {
      if (typeof window !== 'undefined') {
        const seen = localStorage.getItem('etudiants-onboarding-seen')
        if (!seen) {
          // Démarrer l'onboarding après un court délai
          const timer = setTimeout(() => {
            startNextStep('etudiantsTour')
            setHasSeenOnboarding(true)
          }, 1000)
          return () => clearTimeout(timer)
        } else {
          setHasSeenOnboarding(true)
        }
      }
    }
    
    checkOnboarding()
  }, [startNextStep])

  const handleStartOnboarding = () => {
    localStorage.removeItem('etudiants-onboarding-seen')
    startNextStep('etudiantsTour')
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Suivi de stage</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Déclarez un stage et consultez les entreprises
          </p>
        </div>
        {hasSeenOnboarding && !isNextStepVisible && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleStartOnboarding}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Voir le guide
          </Button>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card id="onboarding-nouveau-stage" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Nouveau stage</CardTitle>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Déclarez un nouveau stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/etudiants/formulaire-stage">
                Créer un stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="onboarding-entreprises" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Entreprises</CardTitle>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Liste des entreprises par département
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/etudiants/entreprises">
                Consulter les entreprises
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="onboarding-aide" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Besoin d&apos;aide</CardTitle>
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Chat avec un assistant pour vos questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/etudiants/aide">
                Poser une question
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informations */}
      <Card id="onboarding-fonctionnalites">
        <CardHeader>
          <CardTitle>Bienvenue</CardTitle>
          <CardDescription>
            Déclarez un stage et consultez les entreprises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Fonctionnalités disponibles :</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Déclarer un nouveau stage via le formulaire</li>
              <li>Préremplir automatiquement depuis une convention PDF</li>
              <li>Consulter la liste des entreprises par département</li>
              <li>Poser des questions à l&apos;assistant virtuel sur les stages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
