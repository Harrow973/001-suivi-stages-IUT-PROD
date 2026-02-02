import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getEntreprises } from '@/lib/entreprises-data'
import { Departement } from '@/generated/enums'
import { EntreprisesContent } from '@/components/entreprises/entreprises-content'

interface EntreprisesPageProps {
  searchParams: Promise<{
    departement?: string
    q?: string
    active?: string
  }>
}

// Metadata
export const metadata: Metadata = {
  title: 'Entreprises - Gestion des Stages',
  description: 'Liste et gestion des entreprises partenaires de l\'IUT de la Martinique',
}

/**
 * Page principale des entreprises - Server Component
 * Récupère les données directement depuis Prisma sans passer par l'API
 */
export default async function EntreprisesPage({ searchParams }: EntreprisesPageProps) {
  const params = await searchParams
  const departementParam = params.departement || 'INFO'
  
  // Valider le département
  const validDepartements: Departement[] = ['INFO', 'GEA', 'HSE', 'MLT', 'TC']
  const departement: Departement = validDepartements.includes(departementParam as Departement)
    ? (departementParam as Departement)
    : 'INFO'

  // Rediriger si le département n'est pas valide
  if (!validDepartements.includes(departementParam as Departement)) {
    redirect(`/entreprises?departement=INFO`)
  }

  // Construire les filtres
  const allFilters = {
    departement,
    search: params.q
  }

  const activeFilters = {
    departement,
    search: params.q,
    active: true
  }

  // Récupérer les entreprises
  const [allEntreprises, activeEntreprises] = await Promise.all([
    getEntreprises(allFilters),
    getEntreprises(activeFilters)
  ])

  return (
    <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Chargement des entreprises...</p>
              </div>
    }>
      <EntreprisesContent
        allEntreprises={allEntreprises}
        activeEntreprises={activeEntreprises}
        departement={departement}
        search={params.q}
      />
    </Suspense>
  )
}
