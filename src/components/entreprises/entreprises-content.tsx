'use client'

/**
 * Composant client pour le contenu des entreprises avec tabs
 */

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, File, Building2 } from 'lucide-react'
import { EntreprisesSelection } from './entreprises-selection'
import { exportEntreprisesToCSV } from '@/lib/export-csv'
import type { EntrepriseWithCount } from '@/lib/entreprises-data'

interface EntreprisesContentProps {
  allEntreprises: EntrepriseWithCount[]
  activeEntreprises: EntrepriseWithCount[]
  departement: string
  search?: string
}

export function EntreprisesContent({
  allEntreprises,
  activeEntreprises,
  departement,
  search
}: EntreprisesContentProps) {
  const [activeTab, setActiveTab] = useState('all')

  const handleExport = () => {
    const entreprisesToExport = activeTab === 'all' ? allEntreprises : activeEntreprises
    if (entreprisesToExport.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }
    exportEntreprisesToCSV(entreprisesToExport)
  }

  const currentEntreprises = activeTab === 'all' ? allEntreprises : activeEntreprises

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">Actives</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1" 
            onClick={handleExport} 
            disabled={currentEntreprises.length === 0}
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exporter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/entreprises/ajouter">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Ajouter une Entreprise
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <TabsContent value="all">
        <EntreprisesTabContent
          title="Entreprises"
          description="Gérez et consultez toutes les entreprises partenaires"
          entreprises={allEntreprises}
          departement={departement}
          search={search}
        />
      </TabsContent>

      <TabsContent value="active">
        <EntreprisesTabContent
          title="Entreprises Actives"
          description="Entreprises avec des stages en cours"
          entreprises={activeEntreprises}
          departement={departement}
          search={search}
        />
      </TabsContent>
    </Tabs>
  )
}

interface EntreprisesTabContentProps {
  title: string
  description: string
  entreprises: EntrepriseWithCount[]
  departement: string
  search?: string
}

function EntreprisesTabContent({
  title,
  description,
  entreprises,
  departement,
  search
}: EntreprisesTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {entreprises.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune entreprise trouvée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre première entreprise'}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/entreprises/ajouter">Ajouter une entreprise</Link>
              </Button>
            )}
          </div>
        ) : (
          <EntreprisesSelection 
            entreprises={entreprises} 
            departement={departement}
            search={search}
          />
        )}
      </CardContent>
      {entreprises.length > 0 && (
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Affichage de <strong>{entreprises.length}</strong> entreprise{entreprises.length > 1 ? 's' : ''}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

