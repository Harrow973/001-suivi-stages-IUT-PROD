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
  Building2, 
  Phone,
  Edit,
  Loader2,
  GraduationCap,
  Briefcase,
  User,
  Users
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Etudiant = {
  id: number
  nom: string
  prenom: string
  email: string | null
  promotion: number | null
  anneeUniversitaire: string | null
  _count: {
    stages: number
  }
}

type Stage = {
  id: number
  sujet: string
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'ACTIF' | 'TERMINE' | 'ANNULE'
  promotion: number | null
  anneeUniversitaire: string | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string | null
    promotion: number | null
    anneeUniversitaire: string | null
  } | null
  entreprise: {
    id: number
    nom: string
  } | null
}

type TuteurDetail = {
  id: number
  nom: string
  prenom: string
  telephone: string | null
  email: string | null
  departement: string
  etudiantsActuels: string | null
  etudiantsHistorique: string | null
  entreprise: {
    id: number
    nom: string
    adresse: string | null
    secteur: string | null
  } | null
  etudiants: Etudiant[]
  stages: Stage[]
  _count: {
    etudiants: number
    stages: number
  }
}

export default function TuteurDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tuteur, setTuteur] = useState<TuteurDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTuteur = async () => {
      try {
        const res = await fetch(`/api/tuteurs/${params.id}`)
        if (!res.ok) {
          throw new Error('Tuteur non trouvé')
        }
        const data = await res.json()
        setTuteur(data)
      } catch (error) {
        console.error('Error fetching tuteur:', error)
        alert('Erreur lors du chargement des données du tuteur')
        router.push('/tuteurs')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTuteur()
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Chargement des données...</p>
      </div>
    )
  }

  if (!tuteur) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tuteur non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/tuteurs">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  const stagesActifs = tuteur.stages.filter(s => s.statut === 'ACTIF')
  const stagesTermines = tuteur.stages.filter(s => s.statut === 'TERMINE')

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tuteurs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tuteur.prenom} {tuteur.nom}
            </h1>
            <p className="text-muted-foreground">
              Détails du tuteur pédagogique
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/tuteurs/${tuteur.id}/modifier`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
              <p className="text-lg font-semibold">{tuteur.prenom} {tuteur.nom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Département</p>
              <Badge variant="outline">{tuteur.departement}</Badge>
            </div>
            {tuteur.email ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-sm">{tuteur.email}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              </div>
            )}
            {tuteur.telephone ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </p>
                <p className="text-sm">{tuteur.telephone}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </p>
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tuteur.entreprise ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg font-semibold">{tuteur.entreprise.nom}</p>
                </div>
                {tuteur.entreprise.secteur && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                    <p className="text-sm">{tuteur.entreprise.secteur}</p>
                  </div>
                )}
                {tuteur.entreprise.adresse && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                    <p className="text-sm">{tuteur.entreprise.adresse}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/entreprises/${tuteur.entreprise.id}`}>
                    Voir l&apos;entreprise
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune entreprise assignée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      {(tuteur.etudiantsActuels || tuteur.etudiantsHistorique) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informations supplémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tuteur.etudiantsActuels && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Étudiants actuels</p>
                <p className="text-sm whitespace-pre-wrap">{tuteur.etudiantsActuels}</p>
              </div>
            )}
            {tuteur.etudiantsHistorique && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Historique des étudiants</p>
                <p className="text-sm whitespace-pre-wrap">{tuteur.etudiantsHistorique}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tuteur._count.etudiants}</div>
            <p className="text-xs text-muted-foreground">
              Étudiants suivis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stages</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tuteur._count.stages}</div>
            <p className="text-xs text-muted-foreground">
              {stagesActifs.length} actif{stagesActifs.length > 1 ? 's' : ''}, {stagesTermines.length} terminé{stagesTermines.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stages Actifs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stagesActifs.length}</div>
            <p className="text-xs text-muted-foreground">
              En cours actuellement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des étudiants */}
      {tuteur.etudiants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Étudiants ({tuteur.etudiants.length})
            </CardTitle>
            <CardDescription>
              Liste des étudiants suivis par ce tuteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Promotion</TableHead>
                  <TableHead className="hidden lg:table-cell">Année universitaire</TableHead>
                  <TableHead className="hidden lg:table-cell">Stages</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuteur.etudiants.map((etudiant) => (
                  <TableRow key={etudiant.id}>
                    <TableCell className="font-medium">
                      {etudiant.prenom} {etudiant.nom}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {etudiant.email ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{etudiant.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {etudiant.promotion ? (
                        <Badge variant="outline">BUT {etudiant.promotion}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {etudiant.anneeUniversitaire ? (
                        <span className="text-sm">{etudiant.anneeUniversitaire}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{etudiant._count.stages}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/gestion-etudiants/${etudiant.id}`}>
                          Voir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Liste des stages */}
      {tuteur.stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Stages ({tuteur.stages.length})
            </CardTitle>
            <CardDescription>
              Historique des stages supervisés par ce tuteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="hidden md:table-cell">Étudiant</TableHead>
                  <TableHead className="hidden lg:table-cell">Entreprise</TableHead>
                  <TableHead className="hidden md:table-cell">Promotion</TableHead>
                  <TableHead className="hidden lg:table-cell">Année</TableHead>
                  <TableHead className="hidden md:table-cell">Dates</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuteur.stages.map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {stage.sujet}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {stage.etudiant ? (
                        <Link 
                          href={`/gestion-etudiants/${stage.etudiant.id}`}
                          className="text-sm hover:underline"
                        >
                          {stage.etudiant.prenom} {stage.etudiant.nom}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {stage.entreprise ? (
                        <Link 
                          href={`/entreprises/${stage.entreprise.id}`}
                          className="text-sm hover:underline"
                        >
                          {stage.entreprise.nom}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {stage.promotion ? (
                        <Badge variant="outline">BUT {stage.promotion}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {stage.anneeUniversitaire ? (
                        <span className="text-sm">{stage.anneeUniversitaire}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">
                        {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatutBadge(stage.statut)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/stages/${stage.id}`}>
                          Voir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

