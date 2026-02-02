'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  GraduationCap, 
  Loader2,
  Save,
  Building2
} from 'lucide-react'

type TuteurData = {
  id: number
  nom: string
  prenom: string
  telephone: string | null
  email: string | null
  departement: string
  idEntreprise: number | null
  entreprise: {
    id: number
    nom: string
  } | null
}

type Entreprise = {
  id: number
  nom: string
}

export default function ModifierTuteurPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tuteur, setTuteur] = useState<TuteurData | null>(null)
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [loadingEntreprises, setLoadingEntreprises] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    id_entreprise: null as number | null
  })

  useEffect(() => {
    const fetchTuteur = async () => {
      try {
        const res = await fetch(`/api/tuteurs/${params.id}`)
        if (!res.ok) {
          throw new Error('Tuteur non trouvé')
        }
        const data = await res.json()
        setTuteur(data)
        
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          telephone: data.telephone || '',
          email: data.email || '',
          id_entreprise: data.idEntreprise
        })

        // Charger les entreprises du même département
        if (data.departement) {
          setLoadingEntreprises(true)
          try {
            const entreprisesRes = await fetch(`/api/entreprises?departement=${data.departement}`)
            if (entreprisesRes.ok) {
              const entreprisesData = await entreprisesRes.json()
              setEntreprises(entreprisesData)
            }
          } catch (error) {
            console.error('Error fetching entreprises:', error)
          } finally {
            setLoadingEntreprises(false)
          }
        }
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
      const res = await fetch(`/api/tuteurs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          telephone: formData.telephone || null,
          email: formData.email || null
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

      router.push(`/tuteurs/${params.id}`)
    } catch (error) {
      console.error('Error updating tuteur:', error)
      alert('Erreur lors de la mise à jour du tuteur')
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/tuteurs/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Modifier le tuteur</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {tuteur.prenom} {tuteur.nom}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
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
                />
                {errors.prenom && <p className="text-sm text-destructive">{errors.prenom}</p>}
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

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <label htmlFor="entreprise" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Entreprise
                </label>
                {loadingEntreprises ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des entreprises...
                  </div>
                ) : (
                  <Select
                    value={formData.id_entreprise === null ? 'none' : formData.id_entreprise.toString()}
                    onValueChange={(value) => {
                      handleChange('id_entreprise', value === 'none' ? null : parseInt(value))
                    }}
                  >
                    <SelectTrigger id="entreprise" className={errors.id_entreprise ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune entreprise</SelectItem>
                      {entreprises.map((entreprise) => (
                        <SelectItem key={entreprise.id} value={entreprise.id.toString()}>
                          {entreprise.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.id_entreprise && (
                  <p className="text-sm text-destructive">{errors.id_entreprise}</p>
                )}
                {!loadingEntreprises && entreprises.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucune entreprise disponible pour ce département
                  </p>
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
            <Link href={`/tuteurs/${params.id}`}>Annuler</Link>
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

