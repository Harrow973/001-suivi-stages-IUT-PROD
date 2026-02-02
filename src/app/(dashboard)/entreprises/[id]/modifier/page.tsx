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
  Building2, 
  Loader2,
  Save
} from 'lucide-react'

type EntrepriseData = {
  id: number
  nom: string
  adresse: string | null
  secteur: string | null
  telephone: string | null
  email: string | null
  siret: string | null
  tailleEntreprise: 'TPE' | 'PME' | 'ETI' | 'GE' | null
  estActive: boolean
  departement: string
}

export default function ModifierEntreprisePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [entreprise, setEntreprise] = useState<EntrepriseData | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    secteur: '',
    telephone: '',
    email: '',
    siret: '',
    tailleEntreprise: '' as '' | 'TPE' | 'PME' | 'ETI' | 'GE',
    estActive: true
  })

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const res = await fetch(`/api/entreprises/${params.id}`)
        if (!res.ok) {
          throw new Error('Entreprise non trouvée')
        }
        const data = await res.json()
        setEntreprise(data)
        
        setFormData({
          nom: data.nom || '',
          adresse: data.adresse || '',
          secteur: data.secteur || '',
          telephone: data.telephone || '',
          email: data.email || '',
          siret: data.siret || '',
          tailleEntreprise: data.tailleEntreprise || '',
          estActive: data.estActive !== undefined ? data.estActive : true
        })
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value === 'true' ? true : value === 'false' ? false : value }))
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
      const res = await fetch(`/api/entreprises/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adresse: formData.adresse || null,
          secteur: formData.secteur || null,
          telephone: formData.telephone || null,
          email: formData.email || null,
          siret: formData.siret || null,
          tailleEntreprise: formData.tailleEntreprise || null,
          estActive: formData.estActive
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

      router.push(`/entreprises/${params.id}`)
    } catch (error) {
      console.error('Error updating entreprise:', error)
      alert('Erreur lors de la mise à jour de l\'entreprise')
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/entreprises/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Modifier l&apos;entreprise</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {entreprise.nom}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l&apos;entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium">
                Nom <span className="text-destructive">*</span>
              </label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                className={errors.nom ? 'border-destructive' : ''}
              />
              {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="adresse" className="text-sm font-medium">
                Adresse
              </label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="secteur" className="text-sm font-medium">
                Secteur d&apos;activité
              </label>
              <Input
                id="secteur"
                value={formData.secteur}
                onChange={(e) => handleChange('secteur', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="siret" className="text-sm font-medium">
                SIRET
              </label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                placeholder="12345678901234"
                maxLength={14}
                className={errors.siret ? 'border-destructive' : ''}
              />
              {errors.siret && <p className="text-sm text-destructive">{errors.siret}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tailleEntreprise" className="text-sm font-medium">
                  Taille de l&apos;entreprise
                </label>
                <Select
                  value={formData.tailleEntreprise}
                  onValueChange={(value) => handleChange('tailleEntreprise', value as 'TPE' | 'PME' | 'ETI' | 'GE')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TPE">TPE (Très Petite Entreprise)</SelectItem>
                    <SelectItem value="PME">PME (Petite et Moyenne Entreprise)</SelectItem>
                    <SelectItem value="ETI">ETI (Entreprise de Taille Intermédiaire)</SelectItem>
                    <SelectItem value="GE">GE (Grande Entreprise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="estActive" className="text-sm font-medium">
                  Statut
                </label>
                <Select
                  value={formData.estActive ? 'true' : 'false'}
                  onValueChange={(value) => handleChange('estActive', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="telephone" className="text-sm font-medium">
                  Téléphone
                </label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
            <Link href={`/entreprises/${params.id}`}>Annuler</Link>
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

