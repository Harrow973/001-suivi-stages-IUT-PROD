'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Calendar,
  User,
  Edit,
  Loader2,
  Phone,
  MapPin,
  FileText,
  FileSignature,
  Download,
  Eye
} from 'lucide-react'
import { getFileUrl } from '@/lib/client-file-utils'

type Convention = {
  id: number
  nomFichier: string
  cheminFichier: string
  dateUpload: string
}

type StageDetail = {
  id: number
  sujet: string
  description: string | null
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'ACTIF' | 'TERMINE' | 'ANNULE'
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
    siret: string | null
    tailleEntreprise: 'TPE' | 'PME' | 'ETI' | 'GE' | null
    estActive: boolean
  } | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string | null
    promotion: number | null
    anneeUniversitaire: string | null
  } | null
  tuteur: {
    id: number
    nom: string
    prenom: string
    telephone: string | null
    email: string | null
    entreprise: {
      id: number
      nom: string
    } | null
  } | null
  conventions?: Convention[]
}

export default function StageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [stage, setStage] = useState<StageDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const res = await fetch(`/api/stages/${params.id}`)
        if (!res.ok) {
          throw new Error('Stage non trouvé')
        }
        const data = await res.json()
        
        // Récupérer les conventions associées à ce stage
        try {
          const conventionsRes = await fetch(`/api/conventions-stage?departement=${data.departement}`)
          if (conventionsRes.ok) {
            const allConventions = await conventionsRes.json()
            const stageConventions = allConventions.filter((c: any) => 
              c.stage && c.stage.id === data.id
            ).map((c: any) => ({
              id: c.id,
              nomFichier: c.nomFichier,
              cheminFichier: c.cheminFichier,
              dateUpload: c.dateUpload
            }))
            
            setStage({
              ...data,
              conventions: stageConventions
            })
          } else {
            setStage(data)
          }
        } catch (conventionError) {
          console.warn('Erreur lors de la récupération des conventions:', conventionError)
          setStage(data)
        }
      } catch (error) {
        console.error('Error fetching stage:', error)
        alert('Erreur lors du chargement des données du stage')
        router.push('/stages')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStage()
    }
  }, [params.id, router])

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

  const calculateDuree = (dateDebut: Date | string, dateFin: Date | string) => {
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    const diffTime = Math.abs(fin.getTime() - debut.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Chargement des données...</p>
      </div>
    )
  }

  if (!stage) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Stage non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/stages">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  const duree = calculateDuree(stage.dateDebut, stage.dateFin)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
              {stage.sujet}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Détails du stage
            </p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/stages/${stage.id}/modifier`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations du stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations du stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sujet</p>
              <p className="text-lg font-semibold">{stage.sujet}</p>
            </div>
            {stage.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Description
                </p>
                <p className="text-sm whitespace-pre-wrap">{stage.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <div className="mt-1">{getStatutBadge(stage.statut)}</div>
              </div>
              {stage.promotion && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promotion</p>
                  <Badge variant="outline" className="mt-1">BUT {stage.promotion}</Badge>
                </div>
              )}
            </div>
            {stage.anneeUniversitaire && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Année universitaire</p>
                <p className="text-lg">{stage.anneeUniversitaire}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Département</p>
              <Badge variant="outline">{stage.departement}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dates et durée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période du stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de début</p>
              <p className="text-lg">{formatDate(stage.dateDebut)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de fin</p>
              <p className="text-lg">{formatDate(stage.dateFin)}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground">Durée</p>
              <p className="text-lg font-semibold">{duree} jour{duree > 1 ? 's' : ''}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ({Math.floor(duree / 7)} semaine{duree >= 14 ? 's' : ''} {duree % 7 > 0 ? `et ${duree % 7} jour${duree % 7 > 1 ? 's' : ''}` : ''})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informations étudiant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Étudiant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stage.etudiant ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-lg font-semibold">
                    {stage.etudiant.prenom} {stage.etudiant.nom}
                  </p>
                </div>
                {stage.etudiant.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-sm">{stage.etudiant.email}</p>
                  </div>
                )}
                {stage.etudiant.promotion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Promotion</p>
                    <Badge variant="outline">BUT {stage.etudiant.promotion}</Badge>
                  </div>
                )}
                {stage.etudiant.anneeUniversitaire && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Année universitaire</p>
                    <p className="text-sm">{stage.etudiant.anneeUniversitaire}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/gestion-etudiants/${stage.etudiant.id}`}>
                    Voir le profil
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun étudiant assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Informations entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stage.entreprise ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg font-semibold">{stage.entreprise.nom}</p>
                </div>
                {stage.entreprise.adresse && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </p>
                    <p className="text-sm">{stage.entreprise.adresse}</p>
                  </div>
                )}
                {stage.entreprise.secteur && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                    <p className="text-sm">{stage.entreprise.secteur}</p>
                  </div>
                )}
                {stage.entreprise.telephone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </p>
                    <p className="text-sm">{stage.entreprise.telephone}</p>
                  </div>
                )}
                {stage.entreprise.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-sm">{stage.entreprise.email}</p>
                  </div>
                )}
                {stage.entreprise.siret && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SIRET</p>
                    <p className="text-sm font-mono">{stage.entreprise.siret}</p>
                  </div>
                )}
                {stage.entreprise.tailleEntreprise && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taille de l&apos;entreprise</p>
                    <Badge variant="outline">
                      {stage.entreprise.tailleEntreprise === 'TPE' && 'TPE (Très Petite Entreprise)'}
                      {stage.entreprise.tailleEntreprise === 'PME' && 'PME (Petite et Moyenne Entreprise)'}
                      {stage.entreprise.tailleEntreprise === 'ETI' && 'ETI (Entreprise de Taille Intermédiaire)'}
                      {stage.entreprise.tailleEntreprise === 'GE' && 'GE (Grande Entreprise)'}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  {stage.entreprise.estActive ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/entreprises?departement=${stage.departement}`}>
                    Voir l&apos;entreprise
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune entreprise assignée</p>
            )}
          </CardContent>
        </Card>

        {/* Informations tuteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Tuteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stage.tuteur ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-lg font-semibold">
                    {stage.tuteur.prenom} {stage.tuteur.nom}
                  </p>
                </div>
                {stage.tuteur.telephone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </p>
                    <p className="text-sm">{stage.tuteur.telephone}</p>
                  </div>
                )}
                {stage.tuteur.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-sm">{stage.tuteur.email}</p>
                  </div>
                )}
                {stage.tuteur.entreprise && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Entreprise
                    </p>
                    <p className="text-sm">{stage.tuteur.entreprise.nom}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/tuteurs?departement=${stage.departement}`}>
                    Voir le tuteur
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun tuteur assigné</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conventions de stage */}
      {stage.conventions && stage.conventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Conventions de stage ({stage.conventions.length})
            </CardTitle>
            <CardDescription>
              Documents de convention associés à ce stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stage.conventions.map((convention) => (
                <div 
                  key={convention.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{convention.nomFichier}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploadé le {formatDate(convention.dateUpload)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={getFileUrl(convention.cheminFichier) || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={getFileUrl(convention.cheminFichier) || '#'} 
                        download={convention.nomFichier}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </a>
                    </Button>
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

