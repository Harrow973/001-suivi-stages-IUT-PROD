'use client'

/**
 * Composant client pour les filtres d'étudiants
 */

import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EtudiantsFiltersProps {
  promotionFilter: string
  anneeFilter: string
  onFilterChange: (filterType: 'promotion' | 'annee', value: string) => void
  onClearFilters: () => void
}

export function EtudiantsFilters({
  promotionFilter,
  anneeFilter,
  onFilterChange,
  onClearFilters
}: EtudiantsFiltersProps) {
  const hasActiveFilters = (promotionFilter && promotionFilter !== 'all') || (anneeFilter && anneeFilter !== 'all')

  return (
    <div className="flex items-end gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">Promotion</label>
        <Select value={promotionFilter} onValueChange={(value) => onFilterChange('promotion', value)}>
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
        <Select value={anneeFilter} onValueChange={(value) => onFilterChange('annee', value)}>
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
          onClick={onClearFilters}
        >
          <X className="h-3.5 w-3.5" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}

