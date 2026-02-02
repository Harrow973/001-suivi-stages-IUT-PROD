'use client'

/**
 * Composant client pour le contenu des étudiants avec tabs
 * Gère l'état des tabs et la synchronisation avec l'URL
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, File, Users2 } from 'lucide-react'
import { EtudiantsFilters } from './etudiants-filters'
import { EtudiantsTable } from './etudiants-table'
import { exportEtudiantsToCSV } from '@/lib/export-csv'
import type { EtudiantWithRelations } from '@/lib/etudiants-data'

interface EtudiantsContentProps {
  allEtudiants: EtudiantWithRelations[]
  withTuteurEtudiants: EtudiantWithRelations[]
  withoutTuteurEtudiants: EtudiantWithRelations[]
  departement: string
  search?: string
  promotionFilter: string
  anneeFilter: string
}

export function EtudiantsContent({
  allEtudiants,
  withTuteurEtudiants,
  withoutTuteurEtudiants,
  departement,
  search,
  promotionFilter,
  anneeFilter
}: EtudiantsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('all')

  const handleFilterChange = (filterType: 'promotion' | 'annee', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filterType === 'promotion') {
      if (value && value !== 'all') {
        params.set('promotion', value)
      } else {
        params.delete('promotion')
      }
    } else {
      if (value && value !== 'all') {
        params.set('anneeUniversitaire', value)
      } else {
        params.delete('anneeUniversitaire')
      }
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('promotion')
    params.delete('anneeUniversitaire')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`Supprimer cet étudiant ?`)) return
    
    try {
      const response = await fetch('/api/etudiants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la suppression' }))
        alert(errorData.error || 'Erreur lors de la suppression')
        return
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting etudiant:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleExport = () => {
    const etudiantsToExport = activeTab === 'all' 
      ? allEtudiants 
      : activeTab === 'with-tuteur' 
        ? withTuteurEtudiants 
        : withoutTuteurEtudiants
    if (etudiantsToExport.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }
    exportEtudiantsToCSV(etudiantsToExport)
  }

  const currentEtudiants = activeTab === 'all' 
    ? allEtudiants 
    : activeTab === 'with-tuteur' 
      ? withTuteurEtudiants 
      : withoutTuteurEtudiants

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="with-tuteur">Avec Tuteur</TabsTrigger>
          <TabsTrigger value="without-tuteur">Sans Tuteur</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1" 
            onClick={handleExport} 
            disabled={currentEtudiants.length === 0}
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/gestion-etudiants/ajouter">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Ajouter un Étudiant
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <TabsContent value="all">
        <EtudiantsTabContent
          title="Étudiants"
          description="Gérez et consultez tous les étudiants"
          etudiants={allEtudiants}
          departement={departement}
          search={search}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onDelete={handleDelete}
        />
      </TabsContent>

      <TabsContent value="with-tuteur">
        <EtudiantsTabContent
          title="Étudiants avec Tuteur"
          description="Étudiants ayant un tuteur assigné"
          etudiants={withTuteurEtudiants}
          departement={departement}
          search={search}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onDelete={handleDelete}
        />
      </TabsContent>

      <TabsContent value="without-tuteur">
        <EtudiantsTabContent
          title="Étudiants sans Tuteur"
          description="Étudiants n'ayant pas de tuteur assigné"
          etudiants={withoutTuteurEtudiants}
          departement={departement}
          search={search}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onDelete={handleDelete}
        />
      </TabsContent>
    </Tabs>
  )
}

interface EtudiantsTabContentProps {
  title: string
  description: string
  etudiants: EtudiantWithRelations[]
  departement: string
  search?: string
  promotionFilter: string
  anneeFilter: string
  onFilterChange: (filterType: 'promotion' | 'annee', value: string) => void
  onClearFilters: () => void
  onDelete: (id: number) => void
}

function EtudiantsTabContent({
  title,
  description,
  etudiants,
  departement: _departement,
  search,
  promotionFilter,
  anneeFilter,
  onFilterChange,
  onClearFilters,
  onDelete
}: EtudiantsTabContentProps) {
  // Messages spécifiques selon le type de tab
  const getEmptyMessage = () => {
    if (title.includes('avec Tuteur')) {
      return search 
        ? 'Essayez de modifier vos critères de recherche' 
        : 'Aucun étudiant n\'a de tuteur assigné pour le moment'
    }
    if (title.includes('sans Tuteur')) {
      return search 
        ? 'Essayez de modifier vos critères de recherche' 
        : 'Tous les étudiants ont un tuteur assigné'
    }
    return search 
      ? 'Essayez de modifier vos critères de recherche' 
      : 'Commencez par ajouter votre premier étudiant'
  }

  const getEmptyTitle = () => {
    if (title.includes('avec Tuteur')) {
      return 'Aucun étudiant avec tuteur trouvé'
    }
    if (title.includes('sans Tuteur')) {
      return 'Aucun étudiant sans tuteur trouvé'
    }
    return 'Aucun étudiant trouvé'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <EtudiantsFilters
            promotionFilter={promotionFilter}
            anneeFilter={anneeFilter}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </CardHeader>
      <CardContent>
        {etudiants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{getEmptyTitle()}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {getEmptyMessage()}
            </p>
            {!search && !title.includes('avec Tuteur') && !title.includes('sans Tuteur') && (
              <Button asChild>
                <Link href="/gestion-etudiants/ajouter">Ajouter un étudiant</Link>
              </Button>
            )}
          </div>
        ) : (
          <EtudiantsTable etudiants={etudiants} onDelete={onDelete} />
        )}
      </CardContent>
      {etudiants.length > 0 && (
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Affichage de <strong>{etudiants.length}</strong> étudiant{etudiants.length > 1 ? 's' : ''}
            {title.includes('avec Tuteur') && ' avec tuteur'}
            {title.includes('sans Tuteur') && ' sans tuteur'}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

