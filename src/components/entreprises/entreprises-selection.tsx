'use client'

/**
 * Composant client pour la sélection et suppression d'entreprises
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EntreprisesTable } from './entreprises-table'
import type { EntrepriseWithCount } from '@/lib/entreprises-data'

interface EntreprisesSelectionProps {
  entreprises: EntrepriseWithCount[]
  departement: string
  search?: string
}

export function EntreprisesSelection({ entreprises, departement: _departement, search: _search }: EntreprisesSelectionProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === entreprises.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(entreprises.map(e => e.id))
    }
  }

  const isAllSelected = entreprises.length > 0 && selectedIds.length === entreprises.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < entreprises.length

  const handleDelete = async (ids?: number[]) => {
    const idsToDelete = ids || selectedIds
    if (idsToDelete.length === 0) return
    
    if (!confirm(`Supprimer ${idsToDelete.length} entreprise(s) ?`)) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/entreprises', {
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
    } catch (error) {
      console.error('Error deleting entreprises:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive font-bold text-sm">{selectedIds.length}</span>
            </div>
            <div>
              <p className="font-medium text-sm">
                {selectedIds.length} entreprise{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleDelete()}
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      )}
      <EntreprisesTable 
        entreprises={entreprises} 
        onDelete={(id) => handleDelete([id])}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onToggleSelectAll={toggleSelectAll}
      />
    </>
  )
}

