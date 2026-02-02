import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getEtudiants } from '@/lib/etudiants-data'
import { Departement } from '@/generated/enums'
import { EtudiantsContent } from '@/components/etudiants/etudiants-content'

interface EtudiantsPageProps {
  searchParams: Promise<{
    departement?: string
    q?: string
    hasTuteur?: string
    promotion?: string
    anneeUniversitaire?: string
  }>
}

// Metadata
export const metadata: Metadata = {
  title: 'Étudiants - Gestion des Stages',
  description: 'Liste et gestion des étudiants de l\'IUT de la Martinique',
}

/**
 * Page principale des étudiants - Server Component
 * Récupère les données directement depuis Prisma sans passer par l'API
 */
export default async function EtudiantsPage({ searchParams }: EtudiantsPageProps) {
  const params = await searchParams
  const departementParam = params.departement || 'INFO'
  
  // Valider le département
  const validDepartements: Departement[] = ['INFO', 'GEA', 'HSE', 'MLT', 'TC']
  const departement: Departement = validDepartements.includes(departementParam as Departement)
    ? (departementParam as Departement)
    : 'INFO'

  // Rediriger si le département n'est pas valide
  if (!validDepartements.includes(departementParam as Departement)) {
    redirect(`/gestion-etudiants?departement=INFO`)
  }

  // Construire les filtres de base (sans filtre hasTuteur pour récupérer tous les étudiants)
  const baseFilters = {
    departement,
    search: params.q,
    promotion: params.promotion ? parseInt(params.promotion) : undefined,
    anneeUniversitaire: params.anneeUniversitaire
  }

  // Récupérer les étudiants pour chaque tab en parallèle
  const [allEtudiants, withTuteurEtudiants, withoutTuteurEtudiants] = await Promise.all([
    getEtudiants(baseFilters),
    getEtudiants({ ...baseFilters, hasTuteur: true }),
    getEtudiants({ ...baseFilters, hasTuteur: false })
  ])

  return (
    <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Chargement des étudiants...</p>
              </div>
    }>
      <EtudiantsContent
        allEtudiants={allEtudiants}
        withTuteurEtudiants={withTuteurEtudiants}
        withoutTuteurEtudiants={withoutTuteurEtudiants}
        departement={departement}
        search={params.q}
        promotionFilter={params.promotion || 'all'}
        anneeFilter={params.anneeUniversitaire || 'all'}
      />
    </Suspense>
  )
}
