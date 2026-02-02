'use client'

/**
 * Composant client pour la sélection et suppression de stages
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StagesTable } from './stages-table'
import type { StageWithRelations } from '@/lib/stages-data'

interface StagesSelectionProps {
  stages: StageWithRelations[]
  departement: string
  search?: string
}

export function StagesSelection({ stages, departement: _departement, search: _search }: StagesSelectionProps) {
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
    if (selectedIds.length === stages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(stages.map(s => s.id))
    }
  }

  const isAllSelected = stages.length > 0 && selectedIds.length === stages.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < stages.length

  const handleDelete = async (ids?: number[]) => {
    const idsToDelete = ids || selectedIds
    if (idsToDelete.length === 0) return
    
    if (!confirm(`Supprimer ${idsToDelete.length} stage(s) ?`)) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/stages', {
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
      console.error('Error deleting stages:', error)
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
                {selectedIds.length} stage{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
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
      <StagesTable 
        stages={stages} 
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

