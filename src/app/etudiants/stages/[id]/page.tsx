'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Building2,
  Calendar,
  GraduationCap,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Loader2
} from 'lucide-react'
import { getFileUrl } from '@/lib/client-file-utils'

type StageDetails = {
  id: number
  sujet: string
  description: string | null
  dateDebut: string
  dateFin: string
  statut: string
  promotion: number | null
  anneeUniversitaire: string | null
  departement: string
  entreprise: {
    id: number
    nom: string
    adresse: string | null
    secteur: string | null
    telephone: string | null
    email: string | null
  } | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string | null
  } | null
  tuteur: {
    id: number
    nom: string
    prenom: string
    telephone: string | null
    email: string | null
  } | null
  conventions: Array<{
    id: number
    nomFichier: string
    cheminFichier: string
    dateUpload: string
  }>
  visitesSuivi: Array<{
    id: number
    numeroVisite: number
    dateVisite: string | null
  }>
}

export default function StageDetailsPage() {
  const params = useParams()
  const [stage, setStage] = useState<StageDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const id = params.id as string
        const response = await fetch(`/api/stages/${id}`)
        
        if (!response.ok) {
          throw new Error('Stage non trouvé')
        }

        const data = await response.json()
        
        // Récupérer les conventions et visites
        const conventionsRes = await fetch(`/api/conventions-stage?departement=${data.departement}`)
        const allConventions = await conventionsRes.json()
        const stageConventions = allConventions.filter((c: any) => 
          c.stage && c.stage.id === data.id
        )

        // Récupérer les visites de suivi
        let visites: any[] = []
        try {
          const visitesRes = await fetch(`/api/suivi-stage/${id}/visites`)
          if (visitesRes.ok) {
            visites = await visitesRes.json()
          }
        } catch (e) {
          console.warn('Impossible de récupérer les visites:', e)
        }

        setStage({
          ...data,
          conventions: stageConventions.map((c: any) => ({
            id: c.id,
            nomFichier: c.nomFichier,
            cheminFichier: c.cheminFichier,
            dateUpload: c.dateUpload
          })),
          visitesSuivi: visites.map((v: any) => ({
            id: v.id,
            numeroVisite: v.numeroVisite,
            dateVisite: v.dateVisite
          }))
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStage()
    }
  }, [params.id])

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie'
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getStatutBadge = (statut: string) => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Chargement des détails du stage...</p>
      </div>
    )
  }

  if (error || !stage) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/etudiants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stage non trouvé</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {error || 'Le stage demandé n\'existe pas ou n\'est plus disponible.'}
            </p>
            <Button asChild>
              <Link href="/etudiants">
                Retour aux stages
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Détails du stage</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Informations complètes sur le stage
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/etudiants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{stage.sujet}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatutBadge(stage.statut)}
                {stage.promotion && (
                  <Badge variant="outline">BUT {stage.promotion}</Badge>
                )}
                {stage.anneeUniversitaire && (
                  <Badge variant="outline">{stage.anneeUniversitaire}</Badge>
                )}
                <Badge variant="outline">{stage.departement}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stage.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {stage.description}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date de début</p>
                <p className="text-sm text-muted-foreground">{formatDate(stage.dateDebut)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date de fin</p>
                <p className="text-sm text-muted-foreground">{formatDate(stage.dateFin)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations étudiant */}
      {stage.etudiant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations étudiant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{stage.etudiant.prenom} {stage.etudiant.nom}</p>
              {stage.etudiant.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{stage.etudiant.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations entreprise */}
      {stage.entreprise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{stage.entreprise.nom}</p>
              {stage.entreprise.adresse && (
                <div className="flex items-start gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{stage.entreprise.adresse}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {stage.entreprise.telephone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{stage.entreprise.telephone}</span>
                </div>
              )}
              {stage.entreprise.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{stage.entreprise.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations tuteur */}
      {stage.tuteur && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Tuteur en entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{stage.tuteur.prenom} {stage.tuteur.nom}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {stage.tuteur.telephone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{stage.tuteur.telephone}</span>
                </div>
              )}
              {stage.tuteur.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{stage.tuteur.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conventions */}
      {stage.conventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conventions ({stage.conventions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stage.conventions.map((convention) => (
                <div 
                  key={convention.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{convention.nomFichier}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploadé le {formatDate(convention.dateUpload)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={getFileUrl(convention.cheminFichier) || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Ouvrir
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visites de suivi */}
      {stage.visitesSuivi.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Visites de suivi ({stage.visitesSuivi.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stage.visitesSuivi.map((visite) => (
                <div 
                  key={visite.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">Visite {visite.numeroVisite}</p>
                    {visite.dateVisite && (
                      <p className="text-xs text-muted-foreground">
                        Date : {formatDate(visite.dateVisite)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

