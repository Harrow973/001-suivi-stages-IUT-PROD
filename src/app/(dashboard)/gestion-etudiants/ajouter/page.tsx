'use client'

import { useState } from 'react'
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
  User, 
  Loader2,
  Save
} from 'lucide-react'

export default function AjouterEtudiantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const departement = searchParams.get('departement') || 'INFO'
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    promotion: 'none',
    annee_universitaire: ''
  })

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
      const res = await fetch('/api/etudiants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email || null,
          promotion: formData.promotion && formData.promotion !== 'none' ? parseInt(formData.promotion as string) : null,
          annee_universitaire: formData.annee_universitaire || null,
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

      router.push(`/gestion-etudiants/${data.id}`)
    } catch (error) {
      console.error('Error creating etudiant:', error)
      alert('Erreur lors de la création de l\'étudiant')
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
            <Link href="/gestion-etudiants">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ajouter un étudiant</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Créer un nouvel étudiant
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                <label htmlFor="prenom" className="text-sm font-medium">
                  Prénom <span className="text-destructive">*</span>
                </label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  className={errors.prenom ? 'border-destructive' : ''}
                  required
                />
                {errors.prenom && <p className="text-sm text-destructive">{errors.prenom}</p>}
              </div>
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

            <div className="grid gap-4 md:grid-cols-2">
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
            <Link href="/gestion-etudiants">Annuler</Link>
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
                Créer l&apos;étudiant
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

