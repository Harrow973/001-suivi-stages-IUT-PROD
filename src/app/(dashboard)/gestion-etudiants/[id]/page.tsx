'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Loader2
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Stage = {
  id: number
  sujet: string
  description: string | null
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'ACTIF' | 'TERMINE' | 'ANNULE'
  promotion: number | null
  anneeUniversitaire: string | null
  entreprise: {
    id: number
    nom: string
    adresse: string | null
    secteur: string | null
    telephone: string | null
    email: string | null
  } | null
  tuteur: {
    id: number
    nom: string
    prenom: string
    telephone: string | null
    email: string | null
  } | null
}

type EtudiantDetail = {
  id: number
  nom: string
  prenom: string
  email: string | null
  departement: string
  promotion: number | null
  anneeUniversitaire: string | null
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
  stages: Stage[]
  stagesParPromotion: {
    1: Stage[]
    2: Stage[]
    3: Stage[]
  }
}

export default function EtudiantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [etudiant, setEtudiant] = useState<EtudiantDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEtudiant = async () => {
      try {
        const res = await fetch(`/api/etudiants/${params.id}`)
        if (!res.ok) {
          throw new Error('Étudiant non trouvé')
        }
        const data = await res.json()
        setEtudiant(data)
      } catch (error) {
        console.error('Error fetching etudiant:', error)
        alert('Erreur lors du chargement des données de l\'étudiant')
        router.push('/gestion-etudiants')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEtudiant()
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

  if (!etudiant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Étudiant non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/gestion-etudiants">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  const totalStages = etudiant.stages.length
  const stagesBUT1 = etudiant.stagesParPromotion[1] || []
  const stagesBUT2 = etudiant.stagesParPromotion[2] || []
  const stagesBUT3 = etudiant.stagesParPromotion[3] || []

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gestion-etudiants">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {etudiant.prenom} {etudiant.nom}
            </h1>
            <p className="text-muted-foreground">
              Détails de l&apos;étudiant et historique des stages
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/gestion-etudiants/${etudiant.id}/modifier`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations étudiant */}
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
              <p className="text-lg">{etudiant.prenom} {etudiant.nom}</p>
            </div>
            {etudiant.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-lg">{etudiant.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Département</p>
              <Badge variant="outline">{etudiant.departement}</Badge>
            </div>
            {etudiant.promotion && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promotion actuelle</p>
                <Badge variant="outline">BUT {etudiant.promotion}</Badge>
              </div>
            )}
            {etudiant.anneeUniversitaire && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Année universitaire</p>
                <p className="text-lg">{etudiant.anneeUniversitaire}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations tuteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Tuteur actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {etudiant.tuteur ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg">{etudiant.tuteur.prenom} {etudiant.tuteur.nom}</p>
                </div>
                {etudiant.tuteur.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-lg">{etudiant.tuteur.email}</p>
                  </div>
                )}
                {etudiant.tuteur.telephone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-lg">{etudiant.tuteur.telephone}</p>
                  </div>
                )}
                {etudiant.tuteur.entreprise && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Entreprise
                    </p>
                    <p className="text-lg">{etudiant.tuteur.entreprise.nom}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun tuteur assigné</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Statistiques des stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{totalStages}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{stagesBUT1.length}</p>
              <p className="text-sm text-muted-foreground">BUT 1</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{stagesBUT2.length}</p>
              <p className="text-sm text-muted-foreground">BUT 2</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{stagesBUT3.length}</p>
              <p className="text-sm text-muted-foreground">BUT 3</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des stages par promotion */}
      <div className="space-y-6">
        {/* BUT 3 */}
        {stagesBUT3.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">BUT 3</Badge>
                <span className="text-muted-foreground">({stagesBUT3.length} stage{stagesBUT3.length > 1 ? 's' : ''})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Tuteur</TableHead>
                    <TableHead>Année universitaire</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagesBUT3.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">{stage.sujet}</TableCell>
                      <TableCell>{stage.entreprise?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        {stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : 'N/A'}
                      </TableCell>
                      <TableCell>{stage.anneeUniversitaire || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatutBadge(stage.statut)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
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

        {/* BUT 2 */}
        {stagesBUT2.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">BUT 2</Badge>
                <span className="text-muted-foreground">({stagesBUT2.length} stage{stagesBUT2.length > 1 ? 's' : ''})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Tuteur</TableHead>
                    <TableHead>Année universitaire</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagesBUT2.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">{stage.sujet}</TableCell>
                      <TableCell>{stage.entreprise?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        {stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : 'N/A'}
                      </TableCell>
                      <TableCell>{stage.anneeUniversitaire || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatutBadge(stage.statut)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
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

        {/* BUT 1 */}
        {stagesBUT1.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">BUT 1</Badge>
                <span className="text-muted-foreground">({stagesBUT1.length} stage{stagesBUT1.length > 1 ? 's' : ''})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Tuteur</TableHead>
                    <TableHead>Année universitaire</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagesBUT1.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">{stage.sujet}</TableCell>
                      <TableCell>{stage.entreprise?.nom || 'N/A'}</TableCell>
                      <TableCell>
                        {stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : 'N/A'}
                      </TableCell>
                      <TableCell>{stage.anneeUniversitaire || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatutBadge(stage.statut)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
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

        {/* Message si aucun stage */}
        {totalStages === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucun stage enregistré pour cet étudiant</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

