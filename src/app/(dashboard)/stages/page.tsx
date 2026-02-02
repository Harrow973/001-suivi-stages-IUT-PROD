import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getStages } from '@/lib/stages-data'
import { Departement } from '@/generated/enums'
import { StagesContent } from '@/components/stages/stages-content'

interface StagesPageProps {
  searchParams: Promise<{
    departement?: string
    q?: string
    statut?: string
    promotion?: string
    anneeUniversitaire?: string
  }>
}

// Metadata
export const metadata: Metadata = {
  title: 'Stages - Gestion des Stages',
  description: 'Liste et gestion des stages étudiants de l\'IUT de la Martinique',
}

/**
 * Page principale des stages - Server Component
 * Récupère les données directement depuis Prisma sans passer par l'API
 */
export default async function StagesPage({ searchParams }: StagesPageProps) {
  const params = await searchParams
  const departementParam = params.departement || 'INFO'
  
  // Valider le département
  const validDepartements: Departement[] = ['INFO', 'GEA', 'HSE', 'MLT', 'TC']
  const departement: Departement = validDepartements.includes(departementParam as Departement)
    ? (departementParam as Departement)
    : 'INFO'

  // Rediriger si le département n'est pas valide
  if (!validDepartements.includes(departementParam as Departement)) {
    redirect(`/stages?departement=INFO`)
  }
  
  // Construire les filtres
  const filters = {
    departement,
    search: params.q,
    promotion: params.promotion ? parseInt(params.promotion) : undefined,
    anneeUniversitaire: params.anneeUniversitaire
  }

  // Récupérer tous les stages (sans filtre de statut pour avoir tous les stages)
  const allStages = await getStages(filters)

  // Filtrer par statut côté serveur pour les tabs
  const activeStages = allStages.filter(s => s.statut === 'ACTIF')
  const completedStages = allStages.filter(s => s.statut === 'TERMINE')

  return (
    <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Chargement des stages...</p>
              </div>
    }>
      <StagesContent
        allStages={allStages}
        activeStages={activeStages}
        completedStages={completedStages}
        departement={departement}
        search={params.q}
        promotionFilter={params.promotion || 'all'}
        anneeFilter={params.anneeUniversitaire || 'all'}
      />
    </Suspense>
  )
}
