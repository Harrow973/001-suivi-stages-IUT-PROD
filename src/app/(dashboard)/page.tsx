import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getDashboardStats } from '@/lib/dashboard-stats'
import { Departement } from '@/generated/enums'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentStages } from '@/components/dashboard/recent-stages'
import { OverviewCard } from '@/components/dashboard/overview-card'
import { DashboardActions } from '@/components/dashboard/dashboard-actions'

interface DashboardPageProps {
  searchParams: Promise<{ departement?: string }>
}

// Metadata
export const metadata: Metadata = {
  title: 'Tableau de bord - Gestion des Stages',
  description: 'Vue d\'ensemble des stages, étudiants, entreprises et tuteurs de l\'IUT de la Martinique',
}

/**
 * Page principale du dashboard - Server Component
 * Récupère les données directement depuis Prisma sans passer par l'API
 * Utilise Suspense pour le streaming et les loading states
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const departementParam = params.departement
  
  // Valider et définir le département par défaut
  const validDepartements: Departement[] = ['INFO', 'GEA', 'HSE', 'MLT', 'TC']
  const departement: Departement = departementParam && validDepartements.includes(departementParam as Departement)
    ? (departementParam as Departement)
    : 'INFO'

  // Rediriger vers la page avec le département par défaut si nécessaire
  if (!departementParam || !validDepartements.includes(departementParam as Departement)) {
    redirect(`/?departement=INFO`)
    }

  // Récupérer les statistiques directement depuis Prisma
  const stats = await getDashboardStats(departement)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Vue d&apos;ensemble du département {departement}
          </p>
        </div>
        <Suspense fallback={
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        }>
          <DashboardActions />
        </Suspense>
      </div>

      {/* Cartes de statistiques */}
      <StatsCards stats={stats} />

      {/* Graphiques et listes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentStages stages={stats.stagesRecents} departement={departement} />
        <OverviewCard stats={stats} departement={departement} />
      </div>
    </div>
  )
}
