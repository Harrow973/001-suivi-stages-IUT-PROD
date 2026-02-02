/**
 * Composant de présentation pour les stages récents
 * Server Component - pas d'interactivité nécessaire
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Building2, 
  Users2, 
  GraduationCap,
  Calendar,
  ArrowRight
} from 'lucide-react'
import type { DashboardStats } from '@/lib/dashboard-stats'

interface RecentStagesProps {
  stages: DashboardStats['stagesRecents']
  departement: string
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getStatutBadge(statut: string) {
  switch (statut) {
    case 'ACTIF':
      return <Badge variant="default" className="bg-green-500">Actif</Badge>
    case 'TERMINE':
      return <Badge variant="secondary">Terminé</Badge>
    case 'ANNULE':
      return <Badge variant="destructive">Annulé</Badge>
    default:
      return <Badge variant="outline">{statut}</Badge>
  }
}

export function RecentStages({ stages, departement }: RecentStagesProps) {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stages récents</CardTitle>
            <CardDescription>Les 5 derniers stages ajoutés</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/stages?departement=${departement}`}>
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun stage récent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{stage.sujet}</h4>
                    {getStatutBadge(stage.statut)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    {stage.entreprise && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{stage.entreprise.nom}</span>
                      </span>
                    )}
                    {stage.etudiant && (
                      <span className="flex items-center gap-1">
                        <Users2 className="h-3 w-3" />
                        <span className="truncate">{stage.etudiant.prenom} {stage.etudiant.nom}</span>
                      </span>
                    )}
                    {stage.tuteur && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        <span className="truncate">{stage.tuteur.prenom} {stage.tuteur.nom}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/stages/${stage.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

