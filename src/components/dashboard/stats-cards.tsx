/**
 * Composants de présentation pour les cartes de statistiques
 * Server Component - pas d'interactivité nécessaire
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, 
  Building2, 
  Users2, 
  GraduationCap
} from 'lucide-react'
import type { DashboardStats } from '@/lib/dashboard-stats'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Stages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stages</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.stages.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.stages.actifs} actifs • {stats.stages.termines} terminés
          </p>
        </CardContent>
      </Card>

      {/* Entreprises */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.entreprises.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.entreprises.actives} avec stages actifs
          </p>
        </CardContent>
      </Card>

      {/* Étudiants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.etudiants.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.etudiants.avecTuteur} avec tuteur • {stats.etudiants.sansTuteur} sans tuteur
          </p>
        </CardContent>
      </Card>

      {/* Tuteurs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tuteurs</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tuteurs.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.tuteurs.actifs} actifs
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

