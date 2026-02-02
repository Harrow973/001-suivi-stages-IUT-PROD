'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Building2, 
  Loader2,
  Save
} from 'lucide-react'

function AjouterEntrepriseForm() {
  const router = useRouter()
  const [departement, setDepartement] = useState('INFO')
  
  // Lire les paramètres de recherche côté client uniquement pour éviter les problèmes de pré-rendu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const dept = params.get('departement') || 'INFO'
      setDepartement(dept)
    }
  }, [])
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    secteur: '',
    telephone: '',
    email: ''
  })

  const handleChange = (field: string, value: string) => {
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
      const res = await fetch('/api/entreprises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adresse: formData.adresse || null,
          secteur: formData.secteur || null,
          telephone: formData.telephone || null,
          email: formData.email || null,
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

      router.push(`/entreprises/${data.id}`)
    } catch (error) {
      console.error('Error creating entreprise:', error)
      alert('Erreur lors de la création de l\'entreprise')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/entreprises">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ajouter une entreprise</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Créer une nouvelle entreprise
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
                required
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
            <Link href="/entreprises">Annuler</Link>
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
                Créer l&apos;entreprise
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function AjouterEntreprisePage() {
  return <AjouterEntrepriseForm />
}

