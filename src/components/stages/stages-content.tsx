'use client'

/**
 * Composant client pour le contenu des stages avec tabs et filtres
 * Gère l'état des tabs et la synchronisation avec l'URL
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, File } from 'lucide-react'
import { StagesFilters } from './stages-filters'
import { StagesSelection } from './stages-selection'
import { exportStagesToCSV } from '@/lib/export-csv'
import type { StageWithRelations } from '@/lib/stages-data'

interface StagesContentProps {
  allStages: StageWithRelations[]
  activeStages: StageWithRelations[]
  completedStages: StageWithRelations[]
  departement: string
  search?: string
  promotionFilter: string
  anneeFilter: string
}

export function StagesContent({
  allStages,
  activeStages,
  completedStages,
  departement,
  search,
  promotionFilter,
  anneeFilter
}: StagesContentProps) {
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

  const handleExport = () => {
    const stagesToExport = activeTab === 'all' ? allStages : activeTab === 'active' ? activeStages : completedStages
    if (stagesToExport.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }
    exportStagesToCSV(stagesToExport)
  }

  const currentStages = activeTab === 'all' ? allStages : activeTab === 'active' ? activeStages : completedStages

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">Tous</TabsTrigger>
          <TabsTrigger value="active" className="flex-1 sm:flex-none">Actifs</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-none">Terminés</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1 flex-1 sm:flex-none" 
            onClick={handleExport} 
            disabled={currentStages.length === 0}
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1 flex-1 sm:flex-none" asChild>
            <Link href="/stages/ajouter">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Ajouter un Stage
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <TabsContent value="all">
        <StagesTabContent
          title="Stages"
          description="Gérez et consultez tous les stages étudiants"
          stages={allStages}
          departement={departement}
          search={search}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </TabsContent>

      <TabsContent value="active">
        <StagesTabContent
          title="Stages Actifs"
          description="Stages en cours"
          stages={activeStages}
          departement={departement}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </TabsContent>

      <TabsContent value="completed">
        <StagesTabContent
          title="Stages Terminés"
          description="Stages complétés"
          stages={completedStages}
          departement={departement}
          promotionFilter={promotionFilter}
          anneeFilter={anneeFilter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </TabsContent>
    </Tabs>
  )
}

interface StagesTabContentProps {
  title: string
  description: string
  stages: StageWithRelations[]
  departement: string
  search?: string
  promotionFilter: string
  anneeFilter: string
  onFilterChange: (filterType: 'promotion' | 'annee', value: string) => void
  onClearFilters: () => void
}

function StagesTabContent({
  title,
  description,
  stages,
  departement,
  search,
  promotionFilter,
  anneeFilter,
  onFilterChange,
  onClearFilters
}: StagesTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <StagesFilters
            promotionFilter={promotionFilter}
            anneeFilter={anneeFilter}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <File className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun stage trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre premier stage'}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/stages/ajouter">Ajouter un stage</Link>
              </Button>
            )}
          </div>
        ) : (
          <StagesSelection 
            stages={stages} 
            departement={departement}
            search={search}
          />
        )}
      </CardContent>
      {stages.length > 0 && (
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Affichage de <strong>{stages.length}</strong> stage{stages.length > 1 ? 's' : ''}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

