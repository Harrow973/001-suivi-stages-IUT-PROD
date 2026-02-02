/**
 * Composant de présentation pour la carte de vue d'ensemble
 * Server Component - pas d'interactivité nécessaire
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, 
  Building2, 
  Users2, 
  GraduationCap,
  ArrowRight
} from 'lucide-react'
import type { DashboardStats } from '@/lib/dashboard-stats'

interface OverviewCardProps {
  stats: DashboardStats
  departement: string
}

export function OverviewCard({ stats, departement }: OverviewCardProps) {
  const tauxStagesActifs = stats.stages.total > 0
    ? Math.round((stats.stages.actifs / stats.stages.total) * 100)
    : 0

  const tauxEtudiantsAvecTuteur = stats.etudiants.total > 0
    ? Math.round((stats.etudiants.avecTuteur / stats.etudiants.total) * 100)
    : 0

  const tauxTuteursActifs = stats.tuteurs.total > 0
    ? Math.round((stats.tuteurs.actifs / stats.tuteurs.total) * 100)
    : 0

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Vue d&apos;ensemble</CardTitle>
        <CardDescription>Résumé des activités</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Taux de stages actifs</span>
            <span className="text-sm font-medium">{tauxStagesActifs}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${tauxStagesActifs}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Étudiants avec tuteur</span>
            <span className="text-sm font-medium">{tauxEtudiantsAvecTuteur}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${tauxEtudiantsAvecTuteur}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tuteurs actifs</span>
            <span className="text-sm font-medium">{tauxTuteursActifs}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${tauxTuteursActifs}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <Link
            href={`/stages?departement=${departement}`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">Voir les stages</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/entreprises?departement=${departement}`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Voir les entreprises</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/gestion-etudiants?departement=${departement}`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              <span className="text-sm font-medium">Voir les étudiants</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/tuteurs?departement=${departement}`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm font-medium">Voir les tuteurs</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

