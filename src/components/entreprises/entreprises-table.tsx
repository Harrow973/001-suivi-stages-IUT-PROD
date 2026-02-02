/**
 * Composant de présentation pour le tableau des entreprises
 * Server Component - pas d'interactivité nécessaire pour l'affichage
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, Phone, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { EntrepriseWithCount } from '@/lib/entreprises-data'

interface EntreprisesTableProps {
  entreprises: EntrepriseWithCount[]
  onDelete: (id: number) => void
  selectedIds?: number[]
  onToggleSelection?: (id: number) => void
  isAllSelected?: boolean
  isIndeterminate?: boolean
  onToggleSelectAll?: () => void
}

export function EntreprisesTable({ 
  entreprises, 
  onDelete,
  selectedIds = [],
  onToggleSelection,
  isAllSelected = false,
  isIndeterminate = false,
  onToggleSelectAll
}: EntreprisesTableProps) {
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
          <TableHead>Nom</TableHead>
          <TableHead className="hidden lg:table-cell">Adresse</TableHead>
          <TableHead className="hidden md:table-cell">Contact</TableHead>
          <TableHead className="hidden lg:table-cell">Stages</TableHead>
          <TableHead className="hidden lg:table-cell">Tuteurs</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entreprises.map((entreprise) => (
          <TableRow key={entreprise.id}>
            {showSelection && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(entreprise.id)}
                  onChange={() => onToggleSelection?.(entreprise.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </TableCell>
            )}
            <TableCell className="font-medium">
              {entreprise.nom}
            </TableCell>
            <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
              {entreprise.adresse || 'N/A'}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex flex-col gap-1">
                {entreprise.email && (
                  <div className="flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{entreprise.email}</span>
                  </div>
                )}
                {entreprise.telephone && (
                  <div className="flex items-center gap-1 text-xs">
                    <Phone className="h-3 w-3" />
                    <span>{entreprise.telephone}</span>
                  </div>
                )}
                {!entreprise.email && !entreprise.telephone && 'N/A'}
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <span className="text-sm">{entreprise._count.stages}</span>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <span className="text-sm">{entreprise._count.tuteurs}</span>
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
                    <Link href={`/entreprises/${entreprise.id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Voir les détails
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/entreprises/${entreprise.id}/modifier`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(entreprise.id)}
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

