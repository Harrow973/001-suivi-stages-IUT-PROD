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
  MapPin,
  Edit,
  Loader2,
  GraduationCap,
  Briefcase,
  User,
  Users
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Tuteur = {
  id: number
  nom: string
  prenom: string
  telephone: string | null
  email: string | null
  _count: {
    etudiants: number
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
  tuteur: {
    id: number
    nom: string
    prenom: string
  } | null
}

type EntrepriseDetail = {
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
  tuteurs: Tuteur[]
  stages: Stage[]
  _count: {
    tuteurs: number
    stages: number
  }
}

export default function EntrepriseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entreprise, setEntreprise] = useState<EntrepriseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const res = await fetch(`/api/entreprises/${params.id}`)
        if (!res.ok) {
          throw new Error('Entreprise non trouvée')
        }
        const data = await res.json()
        setEntreprise(data)
      } catch (error) {
        console.error('Error fetching entreprise:', error)
        alert('Erreur lors du chargement des données de l\'entreprise')
        router.push('/entreprises')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEntreprise()
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
        <Loader2 className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Chargement des données...</p>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Entreprise non trouvée</p>
        <Button asChild className="mt-4">
          <Link href="/entreprises">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  const stagesActifs = entreprise.stages.filter(s => s.statut === 'ACTIF')
  const stagesTermines = entreprise.stages.filter(s => s.statut === 'TERMINE')

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/entreprises">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {entreprise.nom}
            </h1>
            <p className="text-muted-foreground">
              Détails de l&apos;entreprise
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/entreprises/${entreprise.id}/modifier`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations de l'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="text-lg font-semibold">{entreprise.nom}</p>
            </div>
            {entreprise.siret && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">SIRET</p>
                <p className="text-lg font-mono">{entreprise.siret}</p>
              </div>
            )}
            {entreprise.tailleEntreprise && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille de l&apos;entreprise</p>
                <Badge variant="outline">{getTailleEntrepriseLabel(entreprise.tailleEntreprise)}</Badge>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              {entreprise.estActive ? (
                <Badge variant="default" className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            {entreprise.secteur && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                <p className="text-lg">{entreprise.secteur}</p>
              </div>
            )}
            {entreprise.adresse && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </p>
                <p className="text-sm">{entreprise.adresse}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Département</p>
              <Badge variant="outline">{entreprise.departement}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Représentant */}
        {(entreprise.representantNom || entreprise.representantQualite) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Représentant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entreprise.representantNom && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Représenté par (nom du signataire de la convention)
                  </p>
                  <p className="text-lg font-semibold">{entreprise.representantNom}</p>
                </div>
              )}
              {entreprise.representantQualite && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualité du représentant</p>
                  <p className="text-sm">{entreprise.representantQualite}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact - Pleine largeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {entreprise.email ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-sm">{entreprise.email}</p>
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
            {entreprise.telephone ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </p>
                <p className="text-sm">{entreprise.telephone}</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stages</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entreprise._count.stages}</div>
            <p className="text-xs text-muted-foreground">
              {stagesActifs.length} actif{stagesActifs.length > 1 ? 's' : ''}, {stagesTermines.length} terminé{stagesTermines.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tuteurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entreprise._count.tuteurs}</div>
            <p className="text-xs text-muted-foreground">
              Tuteurs associés
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

      {/* Liste des tuteurs */}
      {entreprise.tuteurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Tuteurs ({entreprise.tuteurs.length})
            </CardTitle>
            <CardDescription>
              Liste des tuteurs associés à cette entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Étudiants</TableHead>
                  <TableHead className="hidden lg:table-cell">Stages</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entreprise.tuteurs.map((tuteur) => (
                  <TableRow key={tuteur.id}>
                    <TableCell className="font-medium">
                      {tuteur.prenom} {tuteur.nom}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {tuteur.email && (
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{tuteur.email}</span>
                          </div>
                        )}
                        {tuteur.telephone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            <span>{tuteur.telephone}</span>
                          </div>
                        )}
                        {!tuteur.email && !tuteur.telephone && (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{tuteur._count.etudiants}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{tuteur._count.stages}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tuteurs/${tuteur.id}`}>
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
      {entreprise.stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Stages ({entreprise.stages.length})
            </CardTitle>
            <CardDescription>
              Historique des stages effectués dans cette entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="hidden md:table-cell">Étudiant</TableHead>
                  <TableHead className="hidden lg:table-cell">Tuteur</TableHead>
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
                {entreprise.stages.map((stage) => (
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
                      {stage.tuteur ? (
                        <span className="text-sm">{stage.tuteur.prenom} {stage.tuteur.nom}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun</span>
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

