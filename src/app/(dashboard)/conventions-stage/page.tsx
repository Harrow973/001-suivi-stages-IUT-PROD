'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileSignature, Trash2, Download, Eye, X, Search, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getFileUrl } from '@/lib/client-file-utils'

type ConventionStage = {
  id: number
  idStage: number | null
  nomFichier: string
  cheminFichier: string
  tailleFichier: number
  nomEtudiant: string | null
  prenomEtudiant: string | null
  nomEntreprise: string | null
  departement: string
  promotion: number | null
  anneeUniversitaire: string | null
  dateUpload: string
  stage: {
    id: number
    sujet: string
    etudiant: {
      nom: string
      prenom: string
    } | null
    entreprise: {
      nom: string
    } | null
  } | null
}

export default function ConventionsStagePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [conventions, setConventions] = useState<ConventionStage[]>([])
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionFilter, setPromotionFilter] = useState<string>(searchParams.get('promotion') || 'all')
  const [anneeFilter, setAnneeFilter] = useState<string>(searchParams.get('anneeUniversitaire') || 'all')

  // Synchroniser le state avec l'URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearch(q)
    setPromotionFilter(searchParams.get('promotion') || 'all')
    setAnneeFilter(searchParams.get('anneeUniversitaire') || 'all')
  }, [searchParams])

  useEffect(() => {
    const fetchConventions = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        const departement = searchParams.get('departement') || 'INFO'
        params.set('departement', departement)
        if (search) params.set('q', search)
        if (promotionFilter && promotionFilter !== 'all') params.set('promotion', promotionFilter)
        if (anneeFilter && anneeFilter !== 'all') params.set('anneeUniversitaire', anneeFilter)
        
        const res = await fetch(`/api/conventions-stage?${params.toString()}`)
        const data = await res.json()
        setConventions(data)
      } catch (error) {
        console.error('Error fetching conventions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConventions()
  }, [search, searchParams, promotionFilter, anneeFilter])
  
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

  const handleDelete = async (id?: number) => {
    const idToDelete = id || selectedIds[0]
    if (!idToDelete) return
    
    const message = id 
      ? `Supprimer la convention "${conventions.find(c => c.id === id)?.nomFichier}" ?`
      : `Supprimer ${selectedIds.length} convention(s) ?`
    
    if (!confirm(message)) return
    
    try {
      const response = await fetch(`/api/conventions-stage/${idToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la suppression' }))
        alert(errorData.error || 'Erreur lors de la suppression')
        return
      }
      
      setSelectedIds([])
      router.refresh()
      const departement = searchParams.get('departement') || 'INFO'
      const params = new URLSearchParams()
      params.set('departement', departement)
      if (search) params.set('q', search)
      const res = await fetch(`/api/conventions-stage?${params.toString()}`)
      const data = await res.json()
      setConventions(data)
    } catch (error) {
      console.error('Error deleting convention:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === conventions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(conventions.map(c => c.id))
    }
  }

  const isAllSelected = conventions.length > 0 && selectedIds.length === conventions.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < conventions.length

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Conventions de stage
              </CardTitle>
              <CardDescription>
                Consultez et gérez toutes les conventions de stage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, entreprise, fichier..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={promotionFilter}
                  onValueChange={(value) => handleFilterChange('promotion', value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="1">BUT 1</SelectItem>
                    <SelectItem value="2">BUT 2</SelectItem>
                    <SelectItem value="3">BUT 3</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={anneeFilter}
                  onValueChange={(value) => handleFilterChange('annee', value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>

            {/* Tableau des conventions */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conventions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune convention trouvée
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isIndeterminate
                          }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                          aria-label="Sélectionner tout"
                        />
                      </TableHead>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Année</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Date d&apos;upload</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conventions.map((convention) => {
                      const etudiantNom = convention.stage?.etudiant 
                        ? `${convention.stage.etudiant.prenom} ${convention.stage.etudiant.nom}`
                        : convention.prenomEtudiant && convention.nomEtudiant
                        ? `${convention.prenomEtudiant} ${convention.nomEtudiant}`
                        : 'Non renseigné'
                      
                      const entrepriseNom = convention.stage?.entreprise?.nom 
                        || convention.nomEntreprise 
                        || 'Non renseigné'

                      return (
                        <TableRow key={convention.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(convention.id)}
                              onChange={() => toggleSelection(convention.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{etudiantNom}</TableCell>
                          <TableCell>{entrepriseNom}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileSignature className="h-4 w-4 text-muted-foreground" />
                              <span className="max-w-[200px] truncate" title={convention.nomFichier}>
                                {convention.nomFichier}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {convention.promotion ? (
                              <Badge variant="outline">BUT {convention.promotion}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {convention.anneeUniversitaire || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(convention.tailleFichier)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(convention.dateUpload)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getFileUrl(convention.cheminFichier) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Télécharger
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getFileUrl(convention.cheminFichier) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Ouvrir
                                  </a>
                                </DropdownMenuItem>
                                {convention.stage && (
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={`/stages/${convention.stage.id}`}
                                      className="flex items-center gap-2"
                                    >
                                      Voir le stage
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(convention.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Actions en masse */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} convention(s) sélectionnée(s)
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

