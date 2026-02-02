/**
 * Composant de présentation pour le tableau des étudiants
 * Server Component - pas d'interactivité nécessaire pour l'affichage
 */

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { EtudiantWithRelations } from '@/lib/etudiants-data'

interface EtudiantsTableProps {
  etudiants: EtudiantWithRelations[]
  onDelete: (id: number) => void
}

export function EtudiantsTable({ etudiants, onDelete }: EtudiantsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Promotion</TableHead>
          <TableHead>Année</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Stages</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {etudiants.map((etudiant) => (
          <TableRow key={etudiant.id}>
            <TableCell className="font-medium">
              {etudiant.nom}
            </TableCell>
            <TableCell>
              {etudiant.prenom}
            </TableCell>
            <TableCell>
              {etudiant.promotion ? (
                <Badge variant="outline">BUT {etudiant.promotion}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">N/A</span>
              )}
            </TableCell>
            <TableCell>
              {etudiant.anneeUniversitaire ? (
                <span className="text-sm">{etudiant.anneeUniversitaire}</span>
              ) : (
                <span className="text-muted-foreground text-sm">N/A</span>
              )}
            </TableCell>
            <TableCell>
              {etudiant.email ? (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs truncate">{etudiant.email}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">N/A</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm">{etudiant._count.stages}</span>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu d&apos;actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/gestion-etudiants/${etudiant.id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Voir les détails
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/gestion-etudiants/${etudiant.id}/modifier`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(etudiant.id)
                    }}
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

