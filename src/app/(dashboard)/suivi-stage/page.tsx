'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { StageWithRelations } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { File, Eye, Filter, X, Calendar, CheckCircle2, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { exportStagesToCSV } from '@/lib/export-csv'
import { Progress } from '@/components/ui/progress'

export default function SuiviStagePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [stages, setStages] = useState<StageWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [promotionFilter, setPromotionFilter] = useState<string>(searchParams.get('promotion') || 'all')
  const [anneeFilter, setAnneeFilter] = useState<string>(searchParams.get('anneeUniversitaire') || 'all')

  useEffect(() => {
    setPromotionFilter(searchParams.get('promotion') || 'all')
    setAnneeFilter(searchParams.get('anneeUniversitaire') || 'all')
  }, [searchParams])

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        const departement = searchParams.get('departement') || 'INFO'
        params.set('departement', departement)
        if (activeTab === 'active') params.set('statut', 'ACTIF')
        if (activeTab === 'completed') params.set('statut', 'TERMINE')
        if (promotionFilter && promotionFilter !== 'all') params.set('promotion', promotionFilter)
        if (anneeFilter && anneeFilter !== 'all') params.set('anneeUniversitaire', anneeFilter)
        
        const res = await fetch(`/api/stages?${params.toString()}`)
        const data = await res.json()
        setStages(data)
      } catch (error) {
        console.error('Error fetching stages:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStages()
  }, [activeTab, searchParams, promotionFilter, anneeFilter])
  
  const handleFilterChange = (filterType: 'promotion' | 'annee', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filterType === 'promotion') {
      setPromotionFilter(value)
      if (value && value !== 'all') {
        params.set('promotion', value)
      } else {
        params.delete('promotion')
      }
    } else {
      setAnneeFilter(value)
      if (value && value !== 'all') {
        params.set('anneeUniversitaire', value)
      } else {
        params.delete('anneeUniversitaire')
      }
    }
    router.push(`?${params.toString()}`)
  }
  
  const clearFilters = () => {
    setPromotionFilter('all')
    setAnneeFilter('all')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('promotion')
    params.delete('anneeUniversitaire')
    router.push(`?${params.toString()}`)
  }
  
  const hasActiveFilters = (promotionFilter && promotionFilter !== 'all') || (anneeFilter && anneeFilter !== 'all')

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const calculateProgress = (dateDebut: Date | string, dateFin: Date | string) => {
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    const maintenant = new Date()
    
    if (maintenant < debut) return 0
    if (maintenant > fin) return 100
    
    const total = fin.getTime() - debut.getTime()
    const ecoule = maintenant.getTime() - debut.getTime()
    return Math.round((ecoule / total) * 100)
  }

  const getDaysRemaining = (dateFin: Date | string) => {
    const fin = new Date(dateFin)
    const maintenant = new Date()
    const diff = fin.getTime() - maintenant.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
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

  const stagesActifs = stages.filter(s => s.statut === 'ACTIF')
  const stagesTermines = stages.filter(s => s.statut === 'TERMINE')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suivi de stage</h1>
          <p className="text-muted-foreground">
            Suivez l&apos;avancement et le statut des stages
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => exportStagesToCSV(stages)} disabled={loading || stages.length === 0}>
          <File className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Exporter
          </span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stages</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stages.length}</div>
            <p className="text-xs text-muted-foreground">
              Tous les stages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stagesActifs.length}</div>
            <p className="text-xs text-muted-foreground">
              Stages avec statut &quot;Actif&quot;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stagesTermines.length}</div>
            <p className="text-xs text-muted-foreground">
              Stages complétés
            </p>
          </CardContent>
        </Card>
      </div>

      <TabsList>
        <TabsTrigger value="all">Tous</TabsTrigger>
        <TabsTrigger value="active">Actifs</TabsTrigger>
        <TabsTrigger value="completed">Terminés</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Tous les Stages</CardTitle>
                <CardDescription>Vue d&apos;ensemble de tous les stages</CardDescription>
              </div>
              <div className="flex items-end gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Promotion</label>
                  <Select value={promotionFilter} onValueChange={(value) => handleFilterChange('promotion', value)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1">BUT 1</SelectItem>
                      <SelectItem value="2">BUT 2</SelectItem>
                      <SelectItem value="3">BUT 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Année universitaire</label>
                  <Select value={anneeFilter} onValueChange={(value) => handleFilterChange('annee', value)}>
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Année universitaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                      <SelectItem value="2027-2028">2027-2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 self-end"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : stages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-muted-foreground mb-4">Aucun stage trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="hidden md:table-cell">Promotion</TableHead>
                    <TableHead className="hidden lg:table-cell">Période</TableHead>
                    <TableHead className="hidden md:table-cell">Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stages.map((stage) => {
                    const progress = calculateProgress(stage.dateDebut, stage.dateFin)
                    const daysRemaining = getDaysRemaining(stage.dateFin)
                    const isActive = stage.statut === 'ACTIF'
                    
                    return (
                      <TableRow key={stage.id}>
                        <TableCell className="font-medium">
                          {stage.etudiant 
                            ? `${stage.etudiant.prenom} ${stage.etudiant.nom}`
                            : 'Non assigné'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {stage.promotion ? (
                            <Badge variant="outline">BUT {stage.promotion}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col text-sm">
                            <span>{formatDate(stage.dateDebut)}</span>
                            <span className="text-muted-foreground">→ {formatDate(stage.dateFin)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {isActive ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>{progress}%</span>
                                {daysRemaining >= 0 && (
                                  <span className="text-muted-foreground">{daysRemaining}j restants</span>
                                )}
                                {daysRemaining < 0 && (
                                  <span className="text-orange-500">Terminé</span>
                                )}
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatutBadge(stage.statut)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/stages/${stage.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/suivi-stage/${stage.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Formulaire
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {!loading && stages.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Affichage de <strong>{stages.length}</strong> stage{stages.length > 1 ? 's' : ''}
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="active">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Stages Actifs</CardTitle>
                <CardDescription>Stages en cours de réalisation</CardDescription>
              </div>
              <div className="flex items-end gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Promotion</label>
                  <Select value={promotionFilter} onValueChange={(value) => handleFilterChange('promotion', value)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1">BUT 1</SelectItem>
                      <SelectItem value="2">BUT 2</SelectItem>
                      <SelectItem value="3">BUT 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Année universitaire</label>
                  <Select value={anneeFilter} onValueChange={(value) => handleFilterChange('annee', value)}>
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Année universitaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                      <SelectItem value="2027-2028">2027-2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 self-end"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : stagesActifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-muted-foreground mb-4">Aucun stage actif</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="hidden md:table-cell">Promotion</TableHead>
                    <TableHead className="hidden lg:table-cell">Période</TableHead>
                    <TableHead className="hidden md:table-cell">Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagesActifs.map((stage) => {
                    const progress = calculateProgress(stage.dateDebut, stage.dateFin)
                    const daysRemaining = getDaysRemaining(stage.dateFin)
                    
                    return (
                      <TableRow key={stage.id}>
                        <TableCell className="font-medium">
                          {stage.etudiant 
                            ? `${stage.etudiant.prenom} ${stage.etudiant.nom}`
                            : 'Non assigné'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {stage.promotion ? (
                            <Badge variant="outline">BUT {stage.promotion}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col text-sm">
                            <span>{formatDate(stage.dateDebut)}</span>
                            <span className="text-muted-foreground">→ {formatDate(stage.dateFin)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>{progress}%</span>
                              {daysRemaining >= 0 && (
                                <span className="text-muted-foreground">{daysRemaining}j restants</span>
                              )}
                              {daysRemaining < 0 && (
                                <span className="text-orange-500">Terminé</span>
                              )}
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatutBadge(stage.statut)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/stages/${stage.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/suivi-stage/${stage.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Formulaire
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {!loading && stagesActifs.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Affichage de <strong>{stagesActifs.length}</strong> stage{stagesActifs.length > 1 ? 's' : ''} actif{stagesActifs.length > 1 ? 's' : ''}
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="completed">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Stages Terminés</CardTitle>
                <CardDescription>Stages complétés</CardDescription>
              </div>
              <div className="flex items-end gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Promotion</label>
                  <Select value={promotionFilter} onValueChange={(value) => handleFilterChange('promotion', value)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1">BUT 1</SelectItem>
                      <SelectItem value="2">BUT 2</SelectItem>
                      <SelectItem value="3">BUT 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted-foreground">Année universitaire</label>
                  <Select value={anneeFilter} onValueChange={(value) => handleFilterChange('annee', value)}>
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Année universitaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                      <SelectItem value="2027-2028">2027-2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 self-end"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : stagesTermines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-muted-foreground mb-4">Aucun stage terminé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="hidden md:table-cell">Promotion</TableHead>
                    <TableHead className="hidden lg:table-cell">Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagesTermines.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">
                        {stage.etudiant 
                          ? `${stage.etudiant.prenom} ${stage.etudiant.nom}`
                          : 'Non assigné'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {stage.promotion ? (
                          <Badge variant="outline">BUT {stage.promotion}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col text-sm">
                          <span>{formatDate(stage.dateDebut)}</span>
                          <span className="text-muted-foreground">→ {formatDate(stage.dateFin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(stage.statut)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/stages/${stage.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/suivi-stage/${stage.id}`}>
                              <FileText className="h-4 w-4 mr-1" />
                              Formulaire
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {!loading && stagesTermines.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Affichage de <strong>{stagesTermines.length}</strong> stage{stagesTermines.length > 1 ? 's' : ''} terminé{stagesTermines.length > 1 ? 's' : ''}
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  )
}

