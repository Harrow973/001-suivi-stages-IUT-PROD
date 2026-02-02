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
  MapPin,
  Phone,
  Mail,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  Loader2,
  Eye
} from 'lucide-react'

type EntrepriseDetails = {
  id: number
  nom: string
  adresse: string | null
  secteur: string | null
  telephone: string | null
  email: string | null
  siret: string | null
  tailleEntreprise: 'TPE' | 'PME' | 'ETI' | 'GE' | null
  estActive: boolean
  representantNom: string | null
  representantQualite: string | null
  departement: string
  tuteurs: Array<{
    id: number
    nom: string
    prenom: string
    telephone: string | null
    email: string | null
    _count: {
      etudiants: number
      stages: number
    }
  }>
  _count: {
    tuteurs: number
    stages: number
  }
}

type Stage = {
  id: number
  sujet: string
  dateDebut: string
  dateFin: string
  statut: string
  promotion: number | null
  anneeUniversitaire: string | null
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
  } | null
}

export default function EntrepriseDetailsPage() {
  const params = useParams()
  const [entreprise, setEntreprise] = useState<EntrepriseDetails | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const id = params.id as string
        const response = await fetch(`/api/entreprises/${id}`)
        
        if (!response.ok) {
          throw new Error('Entreprise non trouvée')
        }

        const data = await response.json()
        setEntreprise(data)
        setStages(data.stages || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEntreprise()
    }
  }, [params.id])

  const formatDate = (date: Date | string) => {
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

  const getTailleEntrepriseLabel = (taille: string | null) => {
    switch (taille) {
      case 'TPE':
        return 'TPE (Très Petite Entreprise)'
      case 'PME':
        return 'PME (Petite et Moyenne Entreprise)'
      case 'ETI':
        return 'ETI (Entreprise de Taille Intermédiaire)'
      case 'GE':
        return 'GE (Grande Entreprise)'
      default:
        return 'Non renseigné'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Chargement des détails de l'entreprise...</p>
      </div>
    )
  }

  if (error || !entreprise) {
    return (
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/etudiants/entreprises">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Entreprise non trouvée</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {error || 'L\'entreprise demandée n\'existe pas ou n\'est plus disponible.'}
            </p>
            <Button asChild>
              <Link href="/etudiants/entreprises">
                Retour à la liste
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{entreprise.nom}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Détails de l&apos;entreprise
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/etudiants/entreprises">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{entreprise.departement}</Badge>
            {entreprise.secteur && (
              <Badge variant="secondary">{entreprise.secteur}</Badge>
            )}
            {entreprise.estActive ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>

          {entreprise.siret && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">SIRET</p>
              <p className="text-sm font-mono">{entreprise.siret}</p>
            </div>
          )}

          {entreprise.tailleEntreprise && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taille de l&apos;entreprise</p>
              <Badge variant="outline">{getTailleEntrepriseLabel(entreprise.tailleEntreprise)}</Badge>
            </div>
          )}

          {entreprise.adresse && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Adresse</p>
                <p className="text-sm text-muted-foreground">{entreprise.adresse}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {entreprise.telephone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">{entreprise.telephone}</p>
                </div>
              </div>
            )}
            {entreprise.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{entreprise.email}</p>
                </div>
              </div>
            )}
          </div>

          {(entreprise.representantNom || entreprise.representantQualite) && (
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-semibold">Représentant</p>
              {entreprise.representantNom && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Représenté par (nom du signataire de la convention)
                  </p>
                  <p className="text-sm">{entreprise.representantNom}</p>
                </div>
              )}
              {entreprise.representantQualite && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Qualité du représentant</p>
                  <p className="text-sm">{entreprise.representantQualite}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-6 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{entreprise._count.stages}</p>
                <p className="text-xs text-muted-foreground">Stage{entreprise._count.stages > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{entreprise._count.tuteurs}</p>
                <p className="text-xs text-muted-foreground">Tuteur{entreprise._count.tuteurs > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tuteurs */}
      {entreprise.tuteurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tuteurs ({entreprise.tuteurs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {entreprise.tuteurs.map((tuteur) => (
                <Card key={tuteur.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{tuteur.prenom} {tuteur.nom}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          {tuteur.telephone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{tuteur.telephone}</span>
                            </div>
                          )}
                          {tuteur.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{tuteur.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{tuteur._count.etudiants} étudiant{tuteur._count.etudiants > 1 ? 's' : ''}</span>
                          <span>{tuteur._count.stages} stage{tuteur._count.stages > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <GraduationCap className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stages */}
      {stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Stages ({stages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stages.map((stage) => (
                <Card key={stage.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatutBadge(stage.statut)}
                          {stage.promotion && (
                            <Badge variant="outline">BUT {stage.promotion}</Badge>
                          )}
                          {stage.anneeUniversitaire && (
                            <Badge variant="outline">{stage.anneeUniversitaire}</Badge>
                          )}
                        </div>
                        <p className="font-medium mb-1">{stage.sujet}</p>
                        {stage.etudiant && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {stage.etudiant.prenom} {stage.etudiant.nom}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/etudiants/stages/${stage.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

