'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, File, Trash2, GraduationCap, Mail, Phone, Building2, MoreHorizontal, Eye, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { exportTuteursToCSV } from '@/lib/export-csv'

type Tuteur = {
  id: number
  nom: string
  prenom: string
  telephone: string | null
  email: string | null
  entreprise: {
    id: number
    nom: string
  } | null
  _count: {
    stages: number
    etudiants: number
  }
}

export default function TuteursPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tuteurs, setTuteurs] = useState<Tuteur[]>([])
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Synchroniser le state avec l'URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearch(q)
  }, [searchParams])

  useEffect(() => {
    const fetchTuteurs = async () => {
      setLoading(true)
      try {
        const departement = searchParams.get('departement') || 'INFO'
        const params = new URLSearchParams()
        params.set('departement', departement)
        if (search) params.set('q', search)
        if (activeTab === 'active') params.set('active', 'true')
        const res = await fetch(`/api/tuteurs?${params.toString()}`)
        const data = await res.json()
        setTuteurs(data)
      } catch (error) {
        console.error('Error fetching tuteurs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTuteurs()
  }, [search, activeTab, searchParams])

  const handleDelete = async (ids?: number[]) => {
    const idsToDelete = ids || selectedIds
    if (idsToDelete.length === 0) return
    
    if (!confirm(`Supprimer ${idsToDelete.length} tuteur(s) ?`)) return
    
    try {
      const response = await fetch('/api/tuteurs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
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
      const res = await fetch(`/api/tuteurs?${params.toString()}`)
      const data = await res.json()
      setTuteurs(data)
    } catch (error) {
      console.error('Error deleting tuteurs:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === tuteurs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tuteurs.map(t => t.id))
    }
  }

  const isAllSelected = tuteurs.length > 0 && selectedIds.length === tuteurs.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < tuteurs.length

  const handleExport = () => {
    if (tuteurs.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }
    exportTuteursToCSV(tuteurs)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport} disabled={loading || tuteurs.length === 0}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/tuteurs/ajouter">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Ajouter un Tuteur
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Tuteurs entreprise</CardTitle>
            <CardDescription>
              Gérez les tuteurs professionnels des entreprises qui encadrent les étudiants en stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Chargement des tuteurs...</p>
              </div>
            ) : tuteurs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun tuteur trouvé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre premier tuteur'}
                </p>
                {!search && (
                  <Button asChild>
                    <Link href="/tuteurs/ajouter">Ajouter un tuteur</Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {selectedIds.length > 0 && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="text-destructive font-bold text-sm">{selectedIds.length}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedIds.length} tuteur{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete()}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                )}
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
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                      <TableHead className="hidden lg:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Stages</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tuteurs.map((tuteur) => (
                      <TableRow key={tuteur.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(tuteur.id)}
                            onChange={() => toggleSelection(tuteur.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {tuteur.nom}
                        </TableCell>
                        <TableCell>
                          {tuteur.prenom}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {tuteur.entreprise ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="text-sm">{tuteur.entreprise.nom}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucune</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {tuteur.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{tuteur.email}</span>
                              </div>
                            )}
                            {tuteur.telephone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                <span>{tuteur.telephone}</span>
                              </div>
                            )}
                            {!tuteur.email && !tuteur.telephone && 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{tuteur._count.stages}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu d&apos;actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/tuteurs/${tuteur.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Voir les détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/tuteurs/${tuteur.id}/modifier`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete([tuteur.id])}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
          {!loading && tuteurs.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Affichage de <strong>{tuteurs.length}</strong> tuteur{tuteurs.length > 1 ? 's' : ''}
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      <TabsContent value="active">
        <Card>
          <CardHeader>
            <CardTitle>Tuteurs entreprise actifs</CardTitle>
            <CardDescription>Tuteurs professionnels des entreprises avec des étudiants ou stages en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Chargement des tuteurs...</p>
              </div>
            ) : tuteurs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun tuteur actif trouvé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? 'Essayez de modifier vos critères de recherche' : 'Aucun tuteur n\'a d\'étudiants ou de stages pour le moment'}
                </p>
              </div>
            ) : (
              <>
                {selectedIds.length > 0 && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="text-destructive font-bold text-sm">{selectedIds.length}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedIds.length} tuteur{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete()}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                )}
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
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                      <TableHead className="hidden lg:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Stages</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tuteurs.map((tuteur) => (
                      <TableRow key={tuteur.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(tuteur.id)}
                            onChange={() => toggleSelection(tuteur.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {tuteur.nom}
                        </TableCell>
                        <TableCell>
                          {tuteur.prenom}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {tuteur.entreprise ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="text-sm">{tuteur.entreprise.nom}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucune</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {tuteur.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{tuteur.email}</span>
                              </div>
                            )}
                            {tuteur.telephone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                <span>{tuteur.telephone}</span>
                              </div>
                            )}
                            {!tuteur.email && !tuteur.telephone && 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{tuteur._count.stages}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu d&apos;actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/tuteurs/${tuteur.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Voir les détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/tuteurs/${tuteur.id}/modifier`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete([tuteur.id])}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
          {!loading && tuteurs.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Affichage de <strong>{tuteurs.length}</strong> tuteur{tuteurs.length > 1 ? 's' : ''} actif{tuteurs.length > 1 ? 's' : ''}
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  )
}

