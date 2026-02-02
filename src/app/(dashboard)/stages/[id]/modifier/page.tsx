'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Briefcase, 
  Loader2,
  Save
} from 'lucide-react'

type StageData = {
  id: number
  sujet: string
  description: string | null
  dateDebut: Date | string
  dateFin: Date | string
  statut: 'ACTIF' | 'TERMINE' | 'ANNULE'
  promotion: number | null
  anneeUniversitaire: string | null
  departement: string
  idEntreprise: number | null
  idEtudiant: number | null
  idTuteur: number | null
  entreprise: {
    id: number
    nom: string
  } | null
  etudiant: {
    id: number
    nom: string
    prenom: string
  } | null
  tuteur: {
    id: number
    nom: string
    prenom: string
  } | null
}

export default function ModifierStagePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stage, setStage] = useState<StageData | null>(null)
  const [formData, setFormData] = useState({
    sujet: '',
    description: '',
    date_debut: '',
    date_fin: '',
    promotion: 'none',
    annee_universitaire: '',
    statut: 'ACTIF' as 'ACTIF' | 'TERMINE' | 'ANNULE',
    id_entreprise: null as number | null,
    id_etudiant: null as number | null,
    id_tuteur: null as number | null
  })

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const res = await fetch(`/api/stages/${params.id}`)
        if (!res.ok) {
          throw new Error('Stage non trouvé')
        }
        const data = await res.json()
        setStage(data)
        
        // Formater les dates pour les inputs
        const dateDebut = new Date(data.dateDebut)
        const dateFin = new Date(data.dateFin)
        
        setFormData({
          sujet: data.sujet || '',
          description: data.description || '',
          date_debut: dateDebut.toISOString().split('T')[0],
          date_fin: dateFin.toISOString().split('T')[0],
          promotion: data.promotion?.toString() || 'none',
          annee_universitaire: data.anneeUniversitaire || '',
          statut: data.statut || 'ACTIF',
          id_entreprise: data.idEntreprise,
          id_etudiant: data.idEtudiant,
          id_tuteur: data.idTuteur
        })
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

  const handleChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const res = await fetch(`/api/stages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          promotion: formData.promotion && formData.promotion !== 'none' ? parseInt(formData.promotion) : null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          const newErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message
          })
          setErrors(newErrors)
        } else {
          alert(data.error || 'Erreur lors de la mise à jour')
        }
        return
      }

      router.push(`/stages/${params.id}`)
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Erreur lors de la mise à jour du stage')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/stages/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Modifier le stage</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {stage.sujet}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations du stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sujet" className="text-sm font-medium">
                Sujet <span className="text-destructive">*</span>
              </label>
              <Input
                id="sujet"
                value={formData.sujet}
                onChange={(e) => handleChange('sujet', e.target.value)}
                className={errors.sujet ? 'border-destructive' : ''}
              />
              {errors.sujet && <p className="text-sm text-destructive">{errors.sujet}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description ? 'border-destructive' : ''
                }`}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="date_debut" className="text-sm font-medium">
                  Date de début <span className="text-destructive">*</span>
                </label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => handleChange('date_debut', e.target.value)}
                  className={errors.date_debut ? 'border-destructive' : ''}
                />
                {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="date_fin" className="text-sm font-medium">
                  Date de fin <span className="text-destructive">*</span>
                </label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => handleChange('date_fin', e.target.value)}
                  className={errors.date_fin ? 'border-destructive' : ''}
                />
                {errors.date_fin && <p className="text-sm text-destructive">{errors.date_fin}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="promotion" className="text-sm font-medium">
                  Promotion
                </label>
                <Select
                  value={formData.promotion}
                  onValueChange={(value) => handleChange('promotion', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="1">BUT 1</SelectItem>
                    <SelectItem value="2">BUT 2</SelectItem>
                    <SelectItem value="3">BUT 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="annee_universitaire" className="text-sm font-medium">
                  Année universitaire
                </label>
                <Input
                  id="annee_universitaire"
                  value={formData.annee_universitaire}
                  onChange={(e) => handleChange('annee_universitaire', e.target.value)}
                  placeholder="2024-2025"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="statut" className="text-sm font-medium">
                  Statut <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.statut}
                  onValueChange={(value) => handleChange('statut', value as 'ACTIF' | 'TERMINE' | 'ANNULE')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIF">Actif</SelectItem>
                    <SelectItem value="TERMINE">Terminé</SelectItem>
                    <SelectItem value="ANNULE">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Informations liées</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                {stage.entreprise && (
                  <p>Entreprise: <span className="font-medium text-foreground">{stage.entreprise.nom}</span></p>
                )}
                {stage.etudiant && (
                  <p>Étudiant: <span className="font-medium text-foreground">{stage.etudiant.prenom} {stage.etudiant.nom}</span></p>
                )}
                {stage.tuteur && (
                  <p>Tuteur: <span className="font-medium text-foreground">{stage.tuteur.prenom} {stage.tuteur.nom}</span></p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href={`/stages/${params.id}`}>Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

