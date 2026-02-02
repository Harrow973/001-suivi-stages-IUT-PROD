/**
 * Composant de présentation pour le tableau des stages
 * Server Component - pas d'interactivité nécessaire pour l'affichage
 */

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { StageWithRelations } from '@/lib/stages-data'

interface StagesTableProps {
  stages: StageWithRelations[]
  onDelete: (id: number) => void
  selectedIds?: number[]
  onToggleSelection?: (id: number) => void
  isAllSelected?: boolean
  isIndeterminate?: boolean
  onToggleSelectAll?: () => void
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

export function StagesTable({ 
  stages, 
  onDelete, 
  selectedIds = [],
  onToggleSelection,
  isAllSelected = false,
  isIndeterminate = false,
  onToggleSelectAll
}: StagesTableProps) {
  const showSelection = onToggleSelection !== undefined

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showSelection && (
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
                aria-label="Sélectionner tout"
              />
            </TableHead>
          )}
          <TableHead>Étudiant</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead className="hidden md:table-cell">Tuteur</TableHead>
          <TableHead className="hidden md:table-cell">Promotion</TableHead>
          <TableHead className="hidden lg:table-cell">Année</TableHead>
          <TableHead>Sujet</TableHead>
          <TableHead className="hidden md:table-cell">Dates</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stages.map((stage) => (
          <TableRow key={stage.id}>
            {showSelection && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(stage.id)}
                  onChange={() => onToggleSelection?.(stage.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </TableCell>
            )}
            <TableCell className="font-medium">
              {stage.etudiant 
                ? `${stage.etudiant.prenom} ${stage.etudiant.nom}`
                : 'Non assigné'}
            </TableCell>
            <TableCell>{stage.entreprise?.nom || 'N/A'}</TableCell>
            <TableCell className="hidden md:table-cell">
              {stage.tuteur 
                ? `${stage.tuteur.prenom} ${stage.tuteur.nom}`
                : 'Aucun'}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {stage.promotion ? (
                <Badge variant="outline">BUT {stage.promotion}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">N/A</span>
              )}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {stage.anneeUniversitaire ? (
                <span className="text-sm">{stage.anneeUniversitaire}</span>
              ) : (
                <span className="text-muted-foreground text-sm">N/A</span>
              )}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {stage.sujet}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
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
                    <Link href={`/stages/${stage.id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Voir les détails
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/stages/${stage.id}/modifier`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(stage.id)}
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
  )
}

