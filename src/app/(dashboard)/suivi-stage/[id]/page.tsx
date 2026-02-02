'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Save, FileDown, ArrowLeft, User, Building, Briefcase, Plus, Eye, Calendar, Trash2 } from 'lucide-react'
import { FormulaireSuiviStage, EvaluationNiveau, AdequationStage, TypeEchange, ValidationPeriode, AccueilFutur } from '@/types'
import { StageWithRelations } from '@/types'
import Image from 'next/image'

const NIVEAUX_EVALUATION: { value: EvaluationNiveau; label: string }[] = [
  { value: 'insuffisant', label: 'Insuffisant' },
  { value: 'a_améliorer', label: 'À améliorer' },
  { value: 'satisfaisant', label: 'Satisfaisant' },
  { value: 'tres_satisfaisant', label: 'Très satisfaisant' }
]

const ADEQUATION_OPTIONS: { value: AdequationStage; label: string }[] = [
  { value: 'tres_adapte', label: 'Très adapté' },
  { value: 'adapte', label: 'Adapté' },
  { value: 'peu_adapte', label: 'Peu adapté' },
  { value: 'non_adapte', label: 'Non adapté' }
]

const TYPE_ECHANGE_OPTIONS: { value: TypeEchange; label: string }[] = [
  { value: 'visite_entreprise', label: 'Visite en entreprise' },
  { value: 'visioconference', label: 'Entretien en visioconférence' },
  { value: 'telephone', label: 'Entretien téléphonique' },
  { value: 'iut', label: 'Entretien à l\'IUT' }
]

const VALIDATION_OPTIONS: { value: ValidationPeriode; label: string }[] = [
  { value: 'validee', label: 'Période validée' },
  { value: 'validee_reserves', label: 'Période validée avec réserves' },
  { value: 'non_validee', label: 'Période non validée' }
]

const ACCUEIL_FUTUR_OPTIONS: { value: AccueilFutur; label: string }[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'a_discuter', label: 'À discuter' }
]

const DEPARTEMENT_LABELS: Record<string, string> = {
  INFO: 'Informatique',
  GEA: 'Gestion des Entreprises et Administrations',
  HSE: 'Hygiène, Sécurité, Environnement',
  MLT: 'Métiers du Livre et du Patrimoine',
  TC: 'Techniques de Commercialisation'
}

export default function SuiviStageFormPage() {
  const params = useParams()
  const idStage = parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stage, setStage] = useState<StageWithRelations | null>(null)
  const [referentStage, setReferentStage] = useState<{
    id: number
    departement: string
    promotion: number
    anneeUniversitaire: string
    enseignant: {
      id: number
      nom: string
      prenom: string
      email: string | null
      telephone: string | null
    }
  } | null>(null)
  const [visites, setVisites] = useState<Array<{
    id: number
    idStage: number
    numeroVisite: number
    dateVisite: string | null
    donneesFormulaire: FormulaireSuiviStage
    createdAt: string
    updatedAt: string
  }>>([])
  const [visiteActive, setVisiteActive] = useState<number | null>(null) // Numéro de la visite actuellement affichée
  const [formulaire, setFormulaire] = useState<FormulaireSuiviStage>({
    idStage,
    suiviStagiaire: {
      autoEvaluation: {}
    },
    suiviTuteurEntreprise: {
      comportementSavoirEtre: {},
      competencesProfessionnelles: {},
      adequationStage: {}
    },
    suiviTuteurPedagogique: {
      informationsVisite: {
        presents: {}
      },
      verificationCadrePedagogique: {},
      validationPeriode: {}
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/suivi-stage/${idStage}`)
        const data = await res.json()
        
        if (!res.ok) {
          if (data.error === 'Stage non trouvé') {
            alert('Stage non trouvé. Vérifiez que le stage existe.')
            return
          }
          throw new Error(data.error || 'Erreur lors du chargement')
        }
        
        if (data.stage) {
          setStage(data.stage)
        } else {
          alert('Stage non trouvé')
          return
        }
        
        if (data.referentStage) {
          setReferentStage(data.referentStage)
        }
        if (data.visites) {
          setVisites(data.visites)
          // Si des visites existent, ne pas charger automatiquement le formulaire
          // L'utilisateur devra cliquer sur une visite ou créer une nouvelle
          if (data.visites.length === 0) {
            // Si aucune visite, on peut précharger un formulaire vide pour la création
            if (data.formulaire) {
              setFormulaire(data.formulaire)
            }
          }
        } else {
          // Si pas de visites dans la réponse, initialiser avec un formulaire vide
          if (data.formulaire) {
            setFormulaire(data.formulaire)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idStage])

  const handleNouvelleVisite = async () => {
    try {
      const res = await fetch(`/api/suivi-stage/${idStage}/visites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaire: {
            idStage,
            suiviStagiaire: {
              autoEvaluation: {}
            },
            suiviTuteurEntreprise: {
              comportementSavoirEtre: {},
              competencesProfessionnelles: {},
              adequationStage: {}
            },
            suiviTuteurPedagogique: {
              informationsVisite: {
                presents: {}
              },
              verificationCadrePedagogique: {},
              validationPeriode: {}
            }
          }
        })
      })
      if (res.ok) {
        const nouvelleVisite = await res.json()
        // Recharger toutes les visites
        const visitesRes = await fetch(`/api/suivi-stage/${idStage}/visites`)
        if (visitesRes.ok) {
          const visitesData = await visitesRes.json()
          setVisites(visitesData)
        }
        // Charger la nouvelle visite dans le formulaire
        setFormulaire(nouvelleVisite.donneesFormulaire as FormulaireSuiviStage)
        setVisiteActive(nouvelleVisite.numeroVisite)
        // Scroll vers le formulaire
        setTimeout(() => {
          document.getElementById('donnees-generales')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        alert('Erreur lors de la création de la visite')
      }
    } catch (error) {
      console.error('Error creating visite:', error)
      alert('Erreur lors de la création de la visite')
    }
  }

  const handleChargerVisite = async (numeroVisite: number) => {
    try {
      const res = await fetch(`/api/suivi-stage/${idStage}/visites/${numeroVisite}`)
      if (res.ok) {
        const visite = await res.json()
        setFormulaire(visite.donneesFormulaire as FormulaireSuiviStage)
        setVisiteActive(numeroVisite)
        // Scroll vers le formulaire
        setTimeout(() => {
          document.getElementById('donnees-generales')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        alert('Erreur lors du chargement de la visite')
      }
    } catch (error) {
      console.error('Error loading visite:', error)
      alert('Erreur lors du chargement de la visite')
    }
  }

  const handleSupprimerVisite = async (numeroVisite: number) => {
    try {
      const res = await fetch(`/api/suivi-stage/${idStage}/visites/${numeroVisite}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        // Si la visite supprimée était active, réinitialiser
        if (visiteActive === numeroVisite) {
          setVisiteActive(null)
          setFormulaire({
            idStage,
            suiviStagiaire: {
              autoEvaluation: {}
            },
            suiviTuteurEntreprise: {
              comportementSavoirEtre: {},
              competencesProfessionnelles: {},
              adequationStage: {}
            },
            suiviTuteurPedagogique: {
              informationsVisite: {
                presents: {}
              },
              verificationCadrePedagogique: {},
              validationPeriode: {}
            }
          })
        }
        // Recharger toutes les visites
        const visitesRes = await fetch(`/api/suivi-stage/${idStage}/visites`)
        if (visitesRes.ok) {
          const visitesData = await visitesRes.json()
          setVisites(visitesData)
        }
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Erreur lors de la suppression de la visite')
      }
    } catch (error) {
      console.error('Error deleting visite:', error)
      alert('Erreur lors de la suppression de la visite')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/suivi-stage/${idStage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaire)
      })
      if (res.ok) {
        // Recharger les visites après la sauvegarde
        const visitesRes = await fetch(`/api/suivi-stage/${idStage}/visites`)
        if (visitesRes.ok) {
          const visitesData = await visitesRes.json()
          setVisites(visitesData)
        }
        alert('Formulaire sauvegardé avec succès')
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    if (typeof window !== 'undefined') {
      // Sauvegarder le titre original
      const originalTitle = document.title
      
      // Changer le titre pour l'impression (sera visible dans l'en-tête du navigateur)
      document.title = 'Fiche de suivi de stage'
      
      // Afficher un message pour désactiver les en-têtes/pieds de page
      // Note: Dans Chrome/Edge, aller dans "Plus de paramètres" > Décocher "En-têtes et pieds de page"
      // Dans Firefox, aller dans "Plus de paramètres" > Décocher "En-têtes et pieds de page"
      
      // Lancer l'impression
      window.print()
      
      // Restaurer le titre original après un court délai
      setTimeout(() => {
        document.title = originalTitle
      }, 1000)
    }
  }

  // Fonction pour obtenir le label d'une valeur
  const getLabel = (value: string | undefined, options: { value: string; label: string }[]) => {
    if (!value) return ''
    return options.find(opt => opt.value === value)?.label || value
  }

  // Fonction pour formater les dates courtes
  const formatDateShort = (date: Date | string | null | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!stage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Stage non trouvé</p>
        <Button asChild>
          <Link href="/suivi-stage">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  // Le tuteur entreprise est le tuteur lié à l'entreprise du stage
  // On récupère le premier tuteur de l'entreprise s'il existe
  const tuteurEntreprise = (stage.entreprise as { tuteurs?: Array<{ prenom: string; nom: string; telephone?: string | null; email?: string | null }> })?.tuteurs?.[0] || null

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between no-print" style={{ display: 'flex' }}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/suivi-stage">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fiche de suivi de stage</h1>
            <p className="text-muted-foreground">
              {stage.etudiant ? `${stage.etudiant.prenom} ${stage.etudiant.nom}` : 'Stage'} - {stage.sujet}
            </p>
          </div>
        </div>
        {visiteActive && (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>
        )}
      </div>

      {/* Visites précédentes */}
      {visites.length > 0 && (
        <Card className="no-print">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Visites précédentes</CardTitle>
                <CardDescription>
                  Consultez les fiches de suivi des visites précédentes
                </CardDescription>
              </div>
              <Button onClick={handleNouvelleVisite} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle visite
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visites.map((visite) => (
                <Card key={visite.id} className="relative hover:bg-accent transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => handleChargerVisite(visite.numeroVisite)}
                      >
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Visite {visite.numeroVisite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChargerVisite(visite.numeroVisite)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la visite</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la visite {visite.numeroVisite} ? 
                                Cette action est irréversible et toutes les données de cette visite seront perdues.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSupprimerVisite(visite.numeroVisite)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {visite.dateVisite && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDateShort(visite.dateVisite)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Cliquez pour charger cette visite
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton pour créer une nouvelle visite si aucune visite n'existe */}
      {visites.length === 0 && !visiteActive && (
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Aucune visite enregistrée</h3>
                <p className="text-sm text-muted-foreground">
                  Créez votre première visite de suivi de stage
                </p>
              </div>
              <Button onClick={handleNouvelleVisite}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la première visite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Afficher le formulaire uniquement si une visite est active */}
      {visiteActive && (
        <>
          {/* Données générales du stage */}
          <Card id="donnees-generales" className="print:break-inside-avoid no-print">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Données générales du stage</CardTitle>
                  <CardDescription>Informations pré-remplies depuis la base de données</CardDescription>
                </div>
                {visiteActive && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Visite {visiteActive}
                    </span>
                    <Button 
                      onClick={() => setVisiteActive(null)} 
                      variant="outline" 
                      size="sm"
                    >
                      Fermer le formulaire
                    </Button>
                  </div>
                )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stagiaire */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Stagiaire
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nom, prénom :</strong> {stage.etudiant ? `${stage.etudiant.prenom} ${stage.etudiant.nom}` : 'Non assigné'}</p>
                <p><strong>Email :</strong> {stage.etudiant?.email || 'N/A'}</p>
                <p><strong>Département :</strong> {stage.etudiant ? DEPARTEMENT_LABELS[stage.etudiant.departement] || stage.etudiant.departement : 'N/A'}</p>
                <p><strong>Promotion :</strong> {stage.promotion ? `BUT ${stage.promotion}` : 'N/A'}</p>
                <p><strong>Année universitaire :</strong> {stage.anneeUniversitaire || 'N/A'}</p>
              </div>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Stage
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Sujet :</strong> {stage.sujet}</p>
                <p><strong>Description :</strong> {stage.description || 'N/A'}</p>
                <p><strong>Dates :</strong> {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}</p>
                <p><strong>Statut :</strong> {stage.statut}</p>
              </div>
            </div>

            {/* Entreprise */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Entreprise
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nom :</strong> {stage.entreprise?.nom || 'N/A'}</p>
                <p><strong>Adresse :</strong> {stage.entreprise?.adresse || 'N/A'}</p>
                <p><strong>Secteur :</strong> {stage.entreprise?.secteur || 'N/A'}</p>
                <p><strong>Téléphone :</strong> {stage.entreprise?.telephone || 'N/A'}</p>
                <p><strong>Email :</strong> {stage.entreprise?.email || 'N/A'}</p>
              </div>
            </div>

            {/* Tuteurs */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Tuteurs
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Tuteur entreprise :</p>
                  <p>{tuteurEntreprise ? `${tuteurEntreprise.prenom} ${tuteurEntreprise.nom}` : 'Non assigné'}</p>
                  {tuteurEntreprise && (
                    <>
                      <p>Téléphone : {tuteurEntreprise.telephone || 'N/A'}</p>
                      <p>Email : {tuteurEntreprise.email || 'N/A'}</p>
                    </>
                  )}
                </div>
                <div>
                  <p className="font-medium">Tuteur pédagogique :</p>
                  <p>{stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : 'Non assigné'}</p>
                  {stage.tuteur && (
                    <>
                      <p>Département : {DEPARTEMENT_LABELS[stage.tuteur.departement] || stage.tuteur.departement}</p>
                      <p>Email : {stage.tuteur.email || 'N/A'}</p>
                    </>
                  )}
                </div>
                {referentStage && (
                  <div>
                    <p className="font-medium">Référent de stage (promotion) :</p>
                    <p>{referentStage.enseignant.prenom} {referentStage.enseignant.nom}</p>
                    <p>Email : {referentStage.enseignant.email || 'N/A'}</p>
                    <p>Téléphone : {referentStage.enseignant.telephone || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire avec onglets - masqué à l'impression */}
      <Tabs defaultValue="stagiaire" className="w-full no-print" style={{ display: 'block' }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stagiaire">Suivi par le stagiaire</TabsTrigger>
          <TabsTrigger value="tuteur-entreprise">Évaluation tuteur entreprise</TabsTrigger>
          <TabsTrigger value="tuteur-pedagogique">Suivi tuteur pédagogique</TabsTrigger>
        </TabsList>

        {/* Section Stagiaire */}
        <TabsContent value="stagiaire" className="space-y-6">
          <Card id="section-stagiaire" className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Suivi par le stagiaire</CardTitle>
              <CardDescription>À remplir par l&apos;étudiant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Objectifs du stage */}
              <div className="space-y-2">
                <label className="text-sm font-medium">1. Objectifs du stage</label>
                <Textarea
                  placeholder="Rappeler les objectifs principaux du stage (en lien avec les compétences du BUT)"
                  value={formulaire.suiviStagiaire.objectifs || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviStagiaire: {
                      ...formulaire.suiviStagiaire,
                      objectifs: e.target.value
                    }
                  })}
                  rows={4}
                />
              </div>

              {/* Activités réalisées */}
              <div className="space-y-2">
                <label className="text-sm font-medium">2. Activités réalisées</label>
                <Textarea
                  placeholder="Décrire les principales missions / tâches effectuées sur la période"
                  value={formulaire.suiviStagiaire.activitesRealisees || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviStagiaire: {
                      ...formulaire.suiviStagiaire,
                      activitesRealisees: e.target.value
                    }
                  })}
                  rows={4}
                />
              </div>

              {/* Auto-évaluation */}
              <div className="space-y-4">
                <label className="text-sm font-medium">3. Auto-évaluation</label>
                <div className="space-y-3">
                  {[
                    { key: 'implication' as const, label: 'Implication / motivation' },
                    { key: 'autonomie' as const, label: 'Autonomie' },
                    { key: 'communication' as const, label: 'Communication (avec l\'équipe et les encadrants)' },
                    { key: 'gestionTemps' as const, label: 'Gestion du temps / organisation' },
                    { key: 'priseInitiative' as const, label: 'Prise d\'initiative' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm flex-1">{label}</label>
                      <Select
                        value={formulaire.suiviStagiaire.autoEvaluation[key] || ''}
                        onValueChange={(value) => setFormulaire({
                          ...formulaire,
                          suiviStagiaire: {
                            ...formulaire.suiviStagiaire,
                            autoEvaluation: {
                              ...formulaire.suiviStagiaire.autoEvaluation,
                              [key]: value as EvaluationNiveau
                            }
                          }
                        })}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEAUX_EVALUATION.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value}>
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commentaires */}
              <div className="space-y-2">
                <label className="text-sm font-medium">4. Commentaires du stagiaire</label>
                <Textarea
                  placeholder="Points forts, difficultés rencontrées, besoins de formation ou d'encadrement"
                  value={formulaire.suiviStagiaire.commentaires || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviStagiaire: {
                      ...formulaire.suiviStagiaire,
                      commentaires: e.target.value
                    }
                  })}
                  rows={4}
                />
              </div>

              {/* Date et signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de saisie</label>
                  <Input
                    type="date"
                    value={formulaire.suiviStagiaire.dateSaisie || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviStagiaire: {
                        ...formulaire.suiviStagiaire,
                        dateSaisie: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signature du stagiaire</label>
                  <Input
                    placeholder="Nom et prénom"
                    value={formulaire.suiviStagiaire.signature || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviStagiaire: {
                        ...formulaire.suiviStagiaire,
                        signature: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Tuteur Entreprise */}
        <TabsContent value="tuteur-entreprise" className="space-y-6">
          <Card id="section-tuteur-entreprise" className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Évaluation par le tuteur entreprise</CardTitle>
              <CardDescription>À remplir par le tuteur entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appréciation comportement */}
              <div className="space-y-4">
                <label className="text-sm font-medium">1. Appréciation sur le comportement et le savoir-être</label>
                <div className="space-y-3">
                  {[
                    { key: 'assiduite' as const, label: 'Assiduité / ponctualité' },
                    { key: 'respectConsignes' as const, label: 'Respect des consignes et des règles (dont sécurité)' },
                    { key: 'integrationEquipe' as const, label: 'Intégration dans l\'équipe, attitude professionnelle' },
                    { key: 'communication' as const, label: 'Communication avec l\'équipe et les clients/usagers' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm flex-1">{label}</label>
                      <Select
                        value={formulaire.suiviTuteurEntreprise.comportementSavoirEtre[key] || ''}
                        onValueChange={(value) => setFormulaire({
                          ...formulaire,
                          suiviTuteurEntreprise: {
                            ...formulaire.suiviTuteurEntreprise,
                            comportementSavoirEtre: {
                              ...formulaire.suiviTuteurEntreprise.comportementSavoirEtre,
                              [key]: value as EvaluationNiveau
                            }
                          }
                        })}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEAUX_EVALUATION.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value}>
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compétences professionnelles */}
              <div className="space-y-4">
                <label className="text-sm font-medium">2. Compétences professionnelles et techniques</label>
                <div className="space-y-3">
                  {[
                    { key: 'qualiteTravail' as const, label: 'Qualité du travail rendu' },
                    { key: 'rigueurFiabilite' as const, label: 'Rigueur et fiabilité' },
                    { key: 'resolutionProblemes' as const, label: 'Capacité à résoudre un problème simple lié à l\'activité' },
                    { key: 'autonomie' as const, label: 'Autonomie dans les tâches confiées' },
                    { key: 'maitriseOutils' as const, label: 'Maîtrise des outils / technologies / méthodes propres au BUT et au poste' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm flex-1">{label}</label>
                      <Select
                        value={formulaire.suiviTuteurEntreprise.competencesProfessionnelles[key] || ''}
                        onValueChange={(value) => setFormulaire({
                          ...formulaire,
                          suiviTuteurEntreprise: {
                            ...formulaire.suiviTuteurEntreprise,
                            competencesProfessionnelles: {
                              ...formulaire.suiviTuteurEntreprise.competencesProfessionnelles,
                              [key]: value as EvaluationNiveau
                            }
                          }
                        })}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEAUX_EVALUATION.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value}>
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adéquation stage */}
              <div className="space-y-4">
                <label className="text-sm font-medium">3. Adéquation stage – formation BUT</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex-1">Niveau d&apos;adéquation</label>
                    <Select
                      value={formulaire.suiviTuteurEntreprise.adequationStage.niveau || ''}
                      onValueChange={(value) => setFormulaire({
                        ...formulaire,
                        suiviTuteurEntreprise: {
                          ...formulaire.suiviTuteurEntreprise,
                          adequationStage: {
                            ...formulaire.suiviTuteurEntreprise.adequationStage,
                            niveau: value as AdequationStage
                          }
                        }
                      })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADEQUATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Commentaires sur l'adéquation des missions au niveau de formation"
                    value={formulaire.suiviTuteurEntreprise.adequationStage.commentaires || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        adequationStage: {
                          ...formulaire.suiviTuteurEntreprise.adequationStage,
                          commentaires: e.target.value
                        }
                      }
                    })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Appréciation globale */}
              <div className="space-y-4">
                <label className="text-sm font-medium">4. Appréciation globale et recommandations</label>
                <Textarea
                  placeholder="Appréciation générale du tuteur entreprise"
                  value={formulaire.suiviTuteurEntreprise.appreciationGlobale || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviTuteurEntreprise: {
                      ...formulaire.suiviTuteurEntreprise,
                      appreciationGlobale: e.target.value
                    }
                  })}
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm flex-1">Seriez-vous prêt à accueillir à nouveau cet étudiant ?</label>
                  <Select
                    value={formulaire.suiviTuteurEntreprise.accueilFutur || ''}
                    onValueChange={(value) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        accueilFutur: value as AccueilFutur
                      }
                    })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCUEIL_FUTUR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Perspectives (proposition d'emploi, alternance, poursuite de collaboration, etc.)"
                  value={formulaire.suiviTuteurEntreprise.perspectives || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviTuteurEntreprise: {
                      ...formulaire.suiviTuteurEntreprise,
                      perspectives: e.target.value
                    }
                  })}
                  rows={3}
                />
              </div>

              {/* Date, lieu et signature */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lieu</label>
                  <Input
                    value={formulaire.suiviTuteurEntreprise.lieu || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        lieu: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formulaire.suiviTuteurEntreprise.date || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        date: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du tuteur entreprise</label>
                  <Input
                    value={formulaire.suiviTuteurEntreprise.nomTuteur || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        nomTuteur: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className="text-sm font-medium">Signature du tuteur entreprise</label>
                  <Input
                    placeholder="Nom et prénom"
                    value={formulaire.suiviTuteurEntreprise.signature || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurEntreprise: {
                        ...formulaire.suiviTuteurEntreprise,
                        signature: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Tuteur Pédagogique */}
        <TabsContent value="tuteur-pedagogique" className="space-y-6">
          <Card id="section-tuteur-pedagogique" className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Suivi par le tuteur pédagogique</CardTitle>
              <CardDescription>À remplir par le tuteur pédagogique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations visite */}
              <div className="space-y-4">
                <label className="text-sm font-medium">1. Informations de visite / entretien</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex-1">Type d&apos;échange</label>
                    <Select
                      value={formulaire.suiviTuteurPedagogique.informationsVisite.typeEchange || ''}
                      onValueChange={(value) => setFormulaire({
                        ...formulaire,
                        suiviTuteurPedagogique: {
                          ...formulaire.suiviTuteurPedagogique,
                          informationsVisite: {
                            ...formulaire.suiviTuteurPedagogique.informationsVisite,
                            typeEchange: value as TypeEchange
                          }
                        }
                      })}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_ECHANGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex-1">Date de la visite / entretien</label>
                    <Input
                      type="date"
                      className="w-[250px]"
                      value={formulaire.suiviTuteurPedagogique.informationsVisite.dateVisite || ''}
                      onChange={(e) => setFormulaire({
                        ...formulaire,
                        suiviTuteurPedagogique: {
                          ...formulaire.suiviTuteurPedagogique,
                          informationsVisite: {
                            ...formulaire.suiviTuteurPedagogique.informationsVisite,
                            dateVisite: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Présents :</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { key: 'stagiaire' as const, label: 'Stagiaire' },
                        { key: 'tuteurEntreprise' as const, label: 'Tuteur entreprise' },
                        { key: 'autre' as const, label: 'Autre' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            checked={formulaire.suiviTuteurPedagogique.informationsVisite.presents[key] || false}
                            onCheckedChange={(checked) => setFormulaire({
                              ...formulaire,
                              suiviTuteurPedagogique: {
                                ...formulaire.suiviTuteurPedagogique,
                                informationsVisite: {
                                  ...formulaire.suiviTuteurPedagogique.informationsVisite,
                                  presents: {
                                    ...formulaire.suiviTuteurPedagogique.informationsVisite.presents,
                                    [key]: checked as boolean
                                  }
                                }
                              }
                            })}
                          />
                          <label className="text-sm">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vérification cadre pédagogique */}
              <div className="space-y-4">
                <label className="text-sm font-medium">2. Vérification du cadre pédagogique</label>
                <div className="space-y-2">
                  {[
                    { key: 'adequationMissions' as const, label: 'Adéquation des missions avec le référentiel de compétences du BUT' },
                    { key: 'chargeTravailAdaptee' as const, label: 'Charge de travail adaptée au niveau de l\'étudiant' },
                    { key: 'encadrementSuffisant' as const, label: 'Encadrement suffisant en entreprise' },
                    { key: 'conditionsMaterielles' as const, label: 'Conditions matérielles acceptables' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={formulaire.suiviTuteurPedagogique.verificationCadrePedagogique[key] || false}
                        onCheckedChange={(checked) => setFormulaire({
                          ...formulaire,
                          suiviTuteurPedagogique: {
                            ...formulaire.suiviTuteurPedagogique,
                            verificationCadrePedagogique: {
                              ...formulaire.suiviTuteurPedagogique.verificationCadrePedagogique,
                              [key]: checked as boolean
                            }
                          }
                        })}
                      />
                      <label className="text-sm">{label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appréciation synthétique */}
              <div className="space-y-2">
                <label className="text-sm font-medium">3. Appréciation synthétique du tuteur pédagogique</label>
                <Textarea
                  placeholder="Progression des compétences (sur les axes majeurs : technique, méthodologie, communication, autonomie), points de vigilance, actions / conseils pour la suite"
                  value={formulaire.suiviTuteurPedagogique.appreciationSynthetique || ''}
                  onChange={(e) => setFormulaire({
                    ...formulaire,
                    suiviTuteurPedagogique: {
                      ...formulaire.suiviTuteurPedagogique,
                      appreciationSynthetique: e.target.value
                    }
                  })}
                  rows={6}
                />
              </div>

              {/* Validation période */}
              <div className="space-y-4">
                <label className="text-sm font-medium">4. Validation de la période de stage</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex-1">Statut de validation</label>
                    <Select
                      value={formulaire.suiviTuteurPedagogique.validationPeriode.statut || ''}
                      onValueChange={(value) => setFormulaire({
                        ...formulaire,
                        suiviTuteurPedagogique: {
                          ...formulaire.suiviTuteurPedagogique,
                          validationPeriode: {
                            ...formulaire.suiviTuteurPedagogique.validationPeriode,
                            statut: value as ValidationPeriode
                          }
                        }
                      })}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALIDATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(formulaire.suiviTuteurPedagogique.validationPeriode.statut === 'validee_reserves' ||
                    formulaire.suiviTuteurPedagogique.validationPeriode.statut === 'non_validee') && (
                    <Textarea
                      placeholder="Commentaires obligatoires (réserves ou raisons de non-validation)"
                      value={formulaire.suiviTuteurPedagogique.validationPeriode.commentaires || ''}
                      onChange={(e) => setFormulaire({
                        ...formulaire,
                        suiviTuteurPedagogique: {
                          ...formulaire.suiviTuteurPedagogique,
                          validationPeriode: {
                            ...formulaire.suiviTuteurPedagogique.validationPeriode,
                            commentaires: e.target.value
                          }
                        }
                      })}
                      rows={3}
                      required
                    />
                  )}
                </div>
              </div>

              {/* Date et signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formulaire.suiviTuteurPedagogique.date || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurPedagogique: {
                        ...formulaire.suiviTuteurPedagogique,
                        date: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du tuteur pédagogique</label>
                  <Input
                    value={formulaire.suiviTuteurPedagogique.nomTuteur || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurPedagogique: {
                        ...formulaire.suiviTuteurPedagogique,
                        nomTuteur: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Signature du tuteur pédagogique</label>
                  <Input
                    placeholder="Nom et prénom"
                    value={formulaire.suiviTuteurPedagogique.signature || ''}
                    onChange={(e) => setFormulaire({
                      ...formulaire,
                      suiviTuteurPedagogique: {
                        ...formulaire.suiviTuteurPedagogique,
                        signature: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}

      {/* Vue PDF formatée - masquée à l'écran, visible à l'impression */}
      <div id="pdf-view" className="hidden print:block print:visible" style={{ display: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
              background: #ffffff;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
            }
            #pdf-view {
              background: #ffffff !important;
              color: #000000 !important;
              display: block !important;
              visibility: visible !important;
            }
            #pdf-view * {
              color: #000000 !important;
              visibility: visible !important;
            }
            #pdf-view table {
              display: table !important;
            }
            #pdf-view tr {
              display: table-row !important;
            }
            #pdf-view td,
            #pdf-view th {
              display: table-cell !important;
            }
            #pdf-view div {
              display: block !important;
            }
            #pdf-view .pdf-grid {
              display: grid !important;
            }
            #pdf-view span {
              display: inline !important;
            }
            #pdf-view img {
              display: inline-block !important;
              max-width: 100%;
              height: auto;
            }
            .pdf-page {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .pdf-page {
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              page-break-after: always;
            }
            .pdf-page:last-child {
              page-break-after: auto;
            }
            .pdf-header {
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }
            .pdf-logo {
              height: 60px;
              width: auto;
              display: flex;
              align-items: center;
            }
            .pdf-header-content {
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
            }
            .pdf-title {
              font-size: 16pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 5px;
            }
            .pdf-subtitle {
              font-size: 12pt;
              text-align: center;
              margin-bottom: 15px;
            }
            .pdf-section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .pdf-page-break {
              page-break-before: always;
              break-before: page;
            }
            .pdf-page-container {
              min-height: 100vh;
              page-break-after: always;
              break-after: page;
            }
            .pdf-section-title {
              font-size: 13pt;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .pdf-table td {
              padding: 6px;
              border: 1px solid #ddd;
              vertical-align: top;
            }
            .pdf-table th {
              padding: 6px;
              border: 1px solid #000;
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: left;
            }
            .pdf-label {
              font-weight: bold;
              margin-right: 5px;
              color: #000000 !important;
            }
            .pdf-text {
              margin-bottom: 8px;
              color: #000000 !important;
            }
            .pdf-title,
            .pdf-subtitle,
            .pdf-section-title {
              color: #000000 !important;
            }
            .pdf-table td,
            .pdf-table th,
            .pdf-evaluation-table td,
            .pdf-evaluation-table th {
              color: #000000 !important;
            }
            .pdf-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .pdf-evaluation-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .pdf-evaluation-table td {
              padding: 4px 8px;
              border: 1px solid #ddd;
            }
            .pdf-evaluation-table th {
              padding: 4px 8px;
              border: 1px solid #000;
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .pdf-signature {
              margin-top: 30px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
          }
        ` }} />
        
        {/* PAGE 1 : Données générales + Section Stagiaire */}
        <div className="pdf-page pdf-page-container">
          {/* En-tête */}
          <div className="pdf-header">
            <Image
              src="/IUTMartiniquelogo.svg"
              alt="IUT de la Martinique"
              width={200}
              height={60}
              className="pdf-logo"
              style={{ width: 'auto', height: '60px' }}
            />
            <div className="pdf-header-content">
              <div className="pdf-title">FICHE DE SUIVI DE STAGE</div>
              <div className="pdf-subtitle">IUT de la Martinique - {stage.anneeUniversitaire || 'Année universitaire'}</div>
            </div>
          </div>

          {/* Données générales */}
          <div className="pdf-section">
            <div className="pdf-section-title">1. DONNÉES GÉNÉRALES DU STAGE</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}>
                    <div className="pdf-text"><span className="pdf-label">Stagiaire :</span></div>
                    <div className="pdf-text">{stage.etudiant ? `${stage.etudiant.prenom} ${stage.etudiant.nom}` : 'Non assigné'}</div>
                    <div className="pdf-text"><span className="pdf-label">Email :</span> {stage.etudiant?.email || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Département :</span> {stage.etudiant ? DEPARTEMENT_LABELS[stage.etudiant.departement] || stage.etudiant.departement : 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Promotion :</span> {stage.promotion ? `BUT ${stage.promotion}` : 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Année universitaire :</span> {stage.anneeUniversitaire || 'N/A'}</div>
                  </td>
                  <td style={{ width: '50%' }}>
                    <div className="pdf-text"><span className="pdf-label">Sujet du stage :</span></div>
                    <div className="pdf-text">{stage.sujet}</div>
                    <div className="pdf-text"><span className="pdf-label">Description :</span> {stage.description || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Période :</span> {formatDateShort(stage.dateDebut)} → {formatDateShort(stage.dateFin)}</div>
                    <div className="pdf-text"><span className="pdf-label">Statut :</span> {stage.statut}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="pdf-text"><span className="pdf-label">Entreprise :</span></div>
                    <div className="pdf-text">{stage.entreprise?.nom || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Adresse :</span> {stage.entreprise?.adresse || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Secteur :</span> {stage.entreprise?.secteur || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Téléphone :</span> {stage.entreprise?.telephone || 'N/A'}</div>
                    <div className="pdf-text"><span className="pdf-label">Email :</span> {stage.entreprise?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="pdf-text"><span className="pdf-label">Tuteur entreprise :</span></div>
                    <div className="pdf-text">{tuteurEntreprise ? `${tuteurEntreprise.prenom} ${tuteurEntreprise.nom}` : 'Non assigné'}</div>
                    {tuteurEntreprise && (
                      <>
                        <div className="pdf-text"><span className="pdf-label">Téléphone :</span> {tuteurEntreprise.telephone || 'N/A'}</div>
                        <div className="pdf-text"><span className="pdf-label">Email :</span> {tuteurEntreprise.email || 'N/A'}</div>
                      </>
                    )}
                    <div className="pdf-text" style={{ marginTop: '10px' }}><span className="pdf-label">Tuteur pédagogique :</span></div>
                    <div className="pdf-text">{stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : 'Non assigné'}</div>
                    {stage.tuteur && (
                      <>
                        <div className="pdf-text"><span className="pdf-label">Département :</span> {DEPARTEMENT_LABELS[stage.tuteur.departement] || stage.tuteur.departement}</div>
                        <div className="pdf-text"><span className="pdf-label">Email :</span> {stage.tuteur.email || 'N/A'}</div>
                      </>
                    )}
                    {referentStage && (
                      <>
                        <div className="pdf-text" style={{ marginTop: '10px' }}><span className="pdf-label">Référent de stage (promotion) :</span></div>
                        <div className="pdf-text">{referentStage.enseignant.prenom} {referentStage.enseignant.nom}</div>
                        <div className="pdf-text"><span className="pdf-label">Email :</span> {referentStage.enseignant.email || 'N/A'}</div>
                        <div className="pdf-text"><span className="pdf-label">Téléphone :</span> {referentStage.enseignant.telephone || 'N/A'}</div>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section Stagiaire */}
          <div className="pdf-section" style={{ marginTop: '20px' }}>
            <div className="pdf-section-title">2. SUIVI PAR LE STAGIAIRE</div>
            
            <div className="pdf-text"><span className="pdf-label">1. Objectifs du stage :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '40px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviStagiaire.objectifs || '................................................................................'}
            </div>

            <div className="pdf-text"><span className="pdf-label">2. Activités réalisées :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '40px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviStagiaire.activitesRealisees || '................................................................................'}
            </div>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">3. Auto-évaluation :</span></div>
            <table className="pdf-evaluation-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Critère</th>
                  <th style={{ width: '40%' }}>Niveau</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Implication / motivation</td>
                  <td>{getLabel(formulaire.suiviStagiaire.autoEvaluation.implication, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Autonomie</td>
                  <td>{getLabel(formulaire.suiviStagiaire.autoEvaluation.autonomie, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Communication (avec l&apos;équipe et les encadrants)</td>
                  <td>{getLabel(formulaire.suiviStagiaire.autoEvaluation.communication, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Gestion du temps / organisation</td>
                  <td>{getLabel(formulaire.suiviStagiaire.autoEvaluation.gestionTemps, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Prise d&apos;initiative</td>
                  <td>{getLabel(formulaire.suiviStagiaire.autoEvaluation.priseInitiative, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
              </tbody>
            </table>

            <div className="pdf-text" style={{ marginTop: '10px' }}><span className="pdf-label">4. Commentaires du stagiaire :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '50px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviStagiaire.commentaires || '................................................................................'}
            </div>

            <div className="pdf-signature">
              <div className="pdf-grid">
                <div>
                  <div className="pdf-text"><span className="pdf-label">Date de saisie :</span> {formulaire.suiviStagiaire.dateSaisie ? formatDateShort(formulaire.suiviStagiaire.dateSaisie) : '................'}</div>
                </div>
                <div>
                  <div className="pdf-text"><span className="pdf-label">Signature du stagiaire :</span></div>
                  <div className="pdf-text" style={{ marginTop: '20px' }}>{formulaire.suiviStagiaire.signature || '................................................................'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PAGE 2 : Section Tuteur Entreprise */}
        <div className="pdf-page pdf-page-container">
          {/* En-tête */}
          <div className="pdf-header">
            <Image
              src="/IUTMartiniquelogo.svg"
              alt="IUT de la Martinique"
              width={200}
              height={60}
              className="pdf-logo"
              style={{ width: 'auto', height: '60px' }}
            />
            <div className="pdf-header-content">
              <div className="pdf-title">FICHE DE SUIVI DE STAGE</div>
              <div className="pdf-subtitle">IUT de la Martinique - {stage.anneeUniversitaire || 'Année universitaire'}</div>
            </div>
          </div>

          {/* Section Tuteur Entreprise */}
          <div className="pdf-section">
            <div className="pdf-section-title">3. ÉVALUATION PAR LE TUTEUR ENTREPRISE</div>
            
            <div className="pdf-text"><span className="pdf-label">1. Appréciation sur le comportement et le savoir-être :</span></div>
            <table className="pdf-evaluation-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Critère</th>
                  <th style={{ width: '40%' }}>Niveau</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Assiduité / ponctualité</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.comportementSavoirEtre.assiduite, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Respect des consignes et des règles (dont sécurité)</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.comportementSavoirEtre.respectConsignes, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Intégration dans l&apos;équipe, attitude professionnelle</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.comportementSavoirEtre.integrationEquipe, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Communication avec l&apos;équipe et les clients/usagers</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.comportementSavoirEtre.communication, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
              </tbody>
            </table>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">2. Compétences professionnelles et techniques :</span></div>
            <table className="pdf-evaluation-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Critère</th>
                  <th style={{ width: '40%' }}>Niveau</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Qualité du travail rendu</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.competencesProfessionnelles.qualiteTravail, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Rigueur et fiabilité</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.competencesProfessionnelles.rigueurFiabilite, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Capacité à résoudre un problème simple lié à l&apos;activité</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.competencesProfessionnelles.resolutionProblemes, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Autonomie dans les tâches confiées</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.competencesProfessionnelles.autonomie, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
                <tr>
                  <td>Maîtrise des outils / technologies / méthodes propres au BUT et au poste</td>
                  <td>{getLabel(formulaire.suiviTuteurEntreprise.competencesProfessionnelles.maitriseOutils, NIVEAUX_EVALUATION) || '................'}</td>
                </tr>
              </tbody>
            </table>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">3. Adéquation stage – formation BUT :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '5px' }}>
              <span className="pdf-label">Niveau d&apos;adéquation :</span> {getLabel(formulaire.suiviTuteurEntreprise.adequationStage.niveau, ADEQUATION_OPTIONS) || '................'}
            </div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '30px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviTuteurEntreprise.adequationStage.commentaires || 'Commentaires : ................................................................................'}
            </div>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">4. Appréciation globale et recommandations :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '50px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviTuteurEntreprise.appreciationGlobale || '................................................................................'}
            </div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '5px' }}>
              <span className="pdf-label">Seriez-vous prêt à accueillir à nouveau cet étudiant ?</span> {getLabel(formulaire.suiviTuteurEntreprise.accueilFutur, ACCUEIL_FUTUR_OPTIONS) || '................'}
            </div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '30px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviTuteurEntreprise.perspectives || 'Perspectives : ................................................................................'}
            </div>

            <div className="pdf-signature">
              <div className="pdf-grid">
                <div>
                  <div className="pdf-text"><span className="pdf-label">Lieu :</span> {formulaire.suiviTuteurEntreprise.lieu || '................'}</div>
                  <div className="pdf-text"><span className="pdf-label">Date :</span> {formulaire.suiviTuteurEntreprise.date ? formatDateShort(formulaire.suiviTuteurEntreprise.date) : '................'}</div>
                </div>
                <div>
                  <div className="pdf-text"><span className="pdf-label">Nom du tuteur entreprise :</span> {formulaire.suiviTuteurEntreprise.nomTuteur || '................'}</div>
                  <div className="pdf-text" style={{ marginTop: '20px' }}><span className="pdf-label">Signature :</span></div>
                  <div className="pdf-text" style={{ marginTop: '5px' }}>{formulaire.suiviTuteurEntreprise.signature || '................................................................'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PAGE 3 : Section Tuteur Pédagogique */}
        <div className="pdf-page pdf-page-container">
          {/* En-tête */}
          <div className="pdf-header">
            <Image
              src="/IUTMartiniquelogo.svg"
              alt="IUT de la Martinique"
              width={200}
              height={60}
              className="pdf-logo"
              style={{ width: 'auto', height: '60px' }}
            />
            <div className="pdf-header-content">
              <div className="pdf-title">FICHE DE SUIVI DE STAGE</div>
              <div className="pdf-subtitle">IUT de la Martinique - {stage.anneeUniversitaire || 'Année universitaire'}</div>
            </div>
          </div>

          {/* Section Tuteur Pédagogique */}
          <div className="pdf-section">
            <div className="pdf-section-title">4. SUIVI PAR LE TUTEUR PÉDAGOGIQUE</div>
            
            <div className="pdf-text"><span className="pdf-label">1. Informations de visite / entretien :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '5px' }}>
              <span className="pdf-label">Type d&apos;échange :</span> {getLabel(formulaire.suiviTuteurPedagogique.informationsVisite.typeEchange, TYPE_ECHANGE_OPTIONS) || '................'}
            </div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '5px' }}>
              <span className="pdf-label">Date de la visite / entretien :</span> {formulaire.suiviTuteurPedagogique.informationsVisite.dateVisite ? formatDateShort(formulaire.suiviTuteurPedagogique.informationsVisite.dateVisite) : '................'}
            </div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <span className="pdf-label">Présents :</span> 
              {formulaire.suiviTuteurPedagogique.informationsVisite.presents.stagiaire ? ' Stagiaire' : ''}
              {formulaire.suiviTuteurPedagogique.informationsVisite.presents.tuteurEntreprise ? ' Tuteur entreprise' : ''}
              {formulaire.suiviTuteurPedagogique.informationsVisite.presents.autre ? ' Autre' : ''}
              {!formulaire.suiviTuteurPedagogique.informationsVisite.presents.stagiaire && 
               !formulaire.suiviTuteurPedagogique.informationsVisite.presents.tuteurEntreprise && 
               !formulaire.suiviTuteurPedagogique.informationsVisite.presents.autre ? ' ................' : ''}
            </div>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">2. Vérification du cadre pédagogique :</span></div>
            <table className="pdf-evaluation-table">
              <tbody>
                <tr>
                  <td style={{ width: '80%' }}>Adéquation des missions avec le référentiel de compétences du BUT</td>
                  <td style={{ width: '20%', textAlign: 'center' }}>{formulaire.suiviTuteurPedagogique.verificationCadrePedagogique.adequationMissions ? '☑' : '☐'}</td>
                </tr>
                <tr>
                  <td>Charge de travail adaptée au niveau de l&apos;étudiant</td>
                  <td style={{ textAlign: 'center' }}>{formulaire.suiviTuteurPedagogique.verificationCadrePedagogique.chargeTravailAdaptee ? '☑' : '☐'}</td>
                </tr>
                <tr>
                  <td>Encadrement suffisant en entreprise</td>
                  <td style={{ textAlign: 'center' }}>{formulaire.suiviTuteurPedagogique.verificationCadrePedagogique.encadrementSuffisant ? '☑' : '☐'}</td>
                </tr>
                <tr>
                  <td>Conditions matérielles acceptables</td>
                  <td style={{ textAlign: 'center' }}>{formulaire.suiviTuteurPedagogique.verificationCadrePedagogique.conditionsMaterielles ? '☑' : '☐'}</td>
                </tr>
              </tbody>
            </table>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">3. Appréciation synthétique du tuteur pédagogique :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '80px', border: '1px solid #ddd', padding: '5px' }}>
              {formulaire.suiviTuteurPedagogique.appreciationSynthetique || 'Progression des compétences, points de vigilance, actions / conseils pour la suite : ................................................................................'}
            </div>

            <div className="pdf-text" style={{ marginTop: '15px' }}><span className="pdf-label">4. Validation de la période de stage :</span></div>
            <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '5px' }}>
              <span className="pdf-label">Statut de validation :</span> {getLabel(formulaire.suiviTuteurPedagogique.validationPeriode.statut, VALIDATION_OPTIONS) || '................'}
            </div>
            {(formulaire.suiviTuteurPedagogique.validationPeriode.statut === 'validee_reserves' ||
              formulaire.suiviTuteurPedagogique.validationPeriode.statut === 'non_validee') && (
              <div className="pdf-text" style={{ marginLeft: '20px', marginBottom: '10px', minHeight: '40px', border: '1px solid #ddd', padding: '5px' }}>
                {formulaire.suiviTuteurPedagogique.validationPeriode.commentaires || 'Commentaires obligatoires : ................................................................................'}
              </div>
            )}

            <div className="pdf-signature">
              <div className="pdf-grid">
                <div>
                  <div className="pdf-text"><span className="pdf-label">Date :</span> {formulaire.suiviTuteurPedagogique.date ? formatDateShort(formulaire.suiviTuteurPedagogique.date) : '................'}</div>
                </div>
                <div>
                  <div className="pdf-text"><span className="pdf-label">Nom du tuteur pédagogique :</span> {formulaire.suiviTuteurPedagogique.nomTuteur || '................'}</div>
                  <div className="pdf-text" style={{ marginTop: '20px' }}><span className="pdf-label">Signature :</span></div>
                  <div className="pdf-text" style={{ marginTop: '5px' }}>{formulaire.suiviTuteurPedagogique.signature || '................................................................'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

