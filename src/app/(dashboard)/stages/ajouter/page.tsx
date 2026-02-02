'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

type Entreprise = {
  id: number
  nom: string
}

type Etudiant = {
  id: number
  nom: string
  prenom: string
  promotion: number | null
}

type Tuteur = {
  id: number
  nom: string
  prenom: string
  entreprise: {
    nom: string
  } | null
}

export default function AjouterStagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const departement = searchParams.get('departement') || 'INFO'
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [etudiants, setEtudiants] = useState<Etudiant[]>([])
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [formData, setFormData] = useState({
    sujet: '',
    description: '',
    date_debut: '',
    date_fin: '',
    promotion: 'none',
    annee_universitaire: '',
    statut: 'ACTIF' as 'ACTIF' | 'TERMINE' | 'ANNULE',
    id_entreprise: 'none' as string | number,
    id_etudiant: 'none' as string | number,
    id_tuteur: 'none' as string | number
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entreprisesRes, etudiantsRes, tuteursRes] = await Promise.all([
          fetch(`/api/entreprises?departement=${departement}`),
          fetch(`/api/etudiants?departement=${departement}`),
          fetch(`/api/tuteurs?departement=${departement}`)
        ])
        
        const [entreprisesData, etudiantsData, tuteursData] = await Promise.all([
          entreprisesRes.json(),
          etudiantsRes.json(),
          tuteursRes.json()
        ])
        
        setEntreprises(entreprisesData)
        setEtudiants(etudiantsData)
        setTuteurs(tuteursData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [departement])

  const handleChange = (field: string, value: string | number) => {
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
      const res = await fetch('/api/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujet: formData.sujet,
          description: formData.description,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          promotion: formData.promotion && formData.promotion !== 'none' ? formData.promotion : null,
          annee_universitaire: formData.annee_universitaire || null,
          statut: formData.statut,
          id_entreprise: formData.id_entreprise && formData.id_entreprise !== 'none' ? parseInt(formData.id_entreprise as string) : null,
          id_etudiant: formData.id_etudiant && formData.id_etudiant !== 'none' ? parseInt(formData.id_etudiant as string) : null,
          id_tuteur: formData.id_tuteur && formData.id_tuteur !== 'none' ? parseInt(formData.id_tuteur as string) : null,
          departement
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
          alert(data.error || 'Erreur lors de la création')
        }
        return
      }

      router.push(`/stages/${data.id}`)
    } catch (error) {
      console.error('Error creating stage:', error)
      alert('Erreur lors de la création du stage')
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ajouter un stage</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Créer un nouveau stage
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
                required
              />
              {errors.sujet && <p className="text-sm text-destructive">{errors.sujet}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description ? 'border-destructive' : ''
                }`}
                required
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
                  required
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
                  required
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

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="id_entreprise" className="text-sm font-medium">
                  Entreprise
                </label>
                <Select
                  value={formData.id_entreprise.toString()}
                  onValueChange={(value) => handleChange('id_entreprise', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {entreprises.map((entreprise) => (
                      <SelectItem key={entreprise.id} value={entreprise.id.toString()}>
                        {entreprise.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="id_etudiant" className="text-sm font-medium">
                  Étudiant
                </label>
                <Select
                  value={formData.id_etudiant.toString()}
                  onValueChange={(value) => handleChange('id_etudiant', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {etudiants.map((etudiant) => (
                      <SelectItem key={etudiant.id} value={etudiant.id.toString()}>
                        {etudiant.prenom} {etudiant.nom}
                        {etudiant.promotion && ` (BUT ${etudiant.promotion})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="id_tuteur" className="text-sm font-medium">
                  Tuteur
                </label>
                <Select
                  value={formData.id_tuteur.toString()}
                  onValueChange={(value) => handleChange('id_tuteur', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un tuteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {tuteurs.map((tuteur) => (
                      <SelectItem key={tuteur.id} value={tuteur.id.toString()}>
                        {tuteur.prenom} {tuteur.nom}
                        {tuteur.entreprise && ` - ${tuteur.entreprise.nom}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Link href="/stages">Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer le stage
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

