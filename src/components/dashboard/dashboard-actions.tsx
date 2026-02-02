'use client'

/**
 * Composant client pour les actions du dashboard (export, partage)
 * Séparé du Server Component pour permettre l'interactivité
 */

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportAllDepartementData } from '@/lib/export-csv'
import { ShareDialog } from './share-dialog'

export function DashboardActions() {
  const searchParams = useSearchParams()
  const [exporting, setExporting] = useState(false)
  const [formulaireDialogOpen, setFormulaireDialogOpen] = useState(false)
  const [etudiantsDialogOpen, setEtudiantsDialogOpen] = useState(false)

  const departement = searchParams.get('departement') || 'INFO'

  const handleExportAll = async () => {
    setExporting(true)
    try {
      await exportAllDepartementData(departement)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      alert('Erreur lors de l\'export des données')
    } finally {
      setExporting(false)
    }
  }

  const formulaireUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/etudiants/formulaire-stage?departement=${departement}`
    : ''

  const etudiantsUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/etudiants`
    : ''

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={() => setFormulaireDialogOpen(true)}
          variant="default"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Diffuser formulaire
        </Button>
        <Button 
          onClick={() => setEtudiantsDialogOpen(true)}
          variant="default"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Diffuser page étudiants
        </Button>
        <Button 
          onClick={handleExportAll} 
          disabled={exporting}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Export en cours...' : 'Tout exporter'}
        </Button>
      </div>

      <ShareDialog
        open={formulaireDialogOpen}
        onOpenChange={setFormulaireDialogOpen}
        title="Diffuser le formulaire de stage"
        description="Partagez ce lien avec les étudiants pour qu'ils puissent déclarer leur stage."
        url={formulaireUrl}
      />

      <ShareDialog
        open={etudiantsDialogOpen}
        onOpenChange={setEtudiantsDialogOpen}
        title="Diffuser la page étudiants"
        description="Partagez ce lien avec les étudiants pour qu'ils puissent accéder à leur espace."
        url={etudiantsUrl}
      />
    </>
  )
}

