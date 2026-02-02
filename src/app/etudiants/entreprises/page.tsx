'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Building2,
  Search,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Users,
  Briefcase,
  Loader2,
  Eye
} from 'lucide-react'

type Entreprise = {
  id: number
  nom: string
  adresse: string | null
  secteur: string | null
  telephone: string | null
  email: string | null
  departement: string
  _count: {
    stages: number
    tuteurs: number
  }
}

function EntreprisesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departement, setDepartement] = useState<string>(searchParams.get('departement') || 'INFO')

  useEffect(() => {
    fetchEntreprises()
  }, [departement, search])

  const fetchEntreprises = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('departement', departement)
      if (search.trim()) {
        params.set('q', search.trim())
      }
      
      const response = await fetch(`/api/entreprises?${params.toString()}`)
      const data = await response.json()
      setEntreprises(data)
    } catch (error) {
      console.error('Error fetching entreprises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDepartementChange = (value: string) => {
    setDepartement(value)
    router.push(`/etudiants/entreprises?departement=${value}`)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Entreprises</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Liste des entreprises par département
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/etudiants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="departement" className="text-sm font-medium">
                Département
              </label>
              <Select value={departement} onValueChange={handleDepartementChange}>
                <SelectTrigger id="departement">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="GEA">GEA</SelectItem>
                  <SelectItem value="HSE">HSE</SelectItem>
                  <SelectItem value="MLT">MLT</SelectItem>
                  <SelectItem value="TC">TC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Nom, secteur, adresse..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des entreprises */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Chargement des entreprises...</p>
        </div>
      ) : entreprises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune entreprise trouvée</h3>
            <p className="text-sm text-muted-foreground text-center">
              {search.trim()
                ? 'Aucune entreprise ne correspond à votre recherche.'
                : `Aucune entreprise n'est enregistrée pour le département ${departement}.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {entreprises.length} entreprise{entreprises.length > 1 ? 's' : ''} trouvée{entreprises.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entreprises.map((entreprise) => (
              <Card key={entreprise.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {entreprise.nom}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entreprise.departement}</Badge>
                        {entreprise.secteur && (
                          <Badge variant="secondary">{entreprise.secteur}</Badge>
                        )}
                      </div>
                    </div>
                    <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entreprise.adresse && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{entreprise.adresse}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {entreprise.telephone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{entreprise.telephone}</span>
                      </div>
                    )}
                    {entreprise.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{entreprise.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{entreprise._count.stages} stage{entreprise._count.stages > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{entreprise._count.tuteurs} tuteur{entreprise._count.tuteurs > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/etudiants/entreprises/${entreprise.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function EntreprisesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Entreprises</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Liste des entreprises disponibles pour les stages
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <EntreprisesPageContent />
    </Suspense>
  )
}

