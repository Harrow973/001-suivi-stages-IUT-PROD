/**
 * Fonctions utilitaires pour récupérer les stages depuis Prisma
 * Utilisées par les Server Components
 */

import { prisma } from '@/lib/prisma'
import { Departement } from '@/generated/enums'

export interface StageFilters {
  departement: Departement
  search?: string
  statut?: 'ACTIF' | 'TERMINE' | 'ANNULE'
  promotion?: number
  anneeUniversitaire?: string
}

export interface StageWithRelations {
  id: number
  sujet: string
  description: string | null
  dateDebut: Date
  dateFin: Date
  statut: string
  promotion: number | null
  anneeUniversitaire: string | null
  departement: Departement
  entreprise: {
    id: number
    nom: string
  } | null
  etudiant: {
    id: number
    nom: string
    prenom: string
  } | null
  tuteur: {
    id: number
    nom: string
    prenom: string
  } | null
}

/**
 * Récupère les stages avec filtres
 */
export async function getStages(filters: StageFilters): Promise<StageWithRelations[]> {
  const where: {
    departement: Departement
    OR?: Array<{
      sujet?: { contains: string; mode: 'insensitive' }
      description?: { contains: string; mode: 'insensitive' }
      entreprise?: { nom: { contains: string; mode: 'insensitive' } }
      etudiant?: { nom?: { contains: string; mode: 'insensitive' }; prenom?: { contains: string; mode: 'insensitive' } }
    }>
    statut?: 'ACTIF' | 'TERMINE' | 'ANNULE'
    promotion?: number
    anneeUniversitaire?: string
  } = {
    departement: filters.departement
  }

  // Filtre par recherche
  if (filters.search) {
    where.OR = [
      { sujet: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { entreprise: { nom: { contains: filters.search, mode: 'insensitive' } } },
      { etudiant: { nom: { contains: filters.search, mode: 'insensitive' } } },
      { etudiant: { prenom: { contains: filters.search, mode: 'insensitive' } } }
    ]
  }

  // Filtre par statut
  if (filters.statut) {
    where.statut = filters.statut
  }

  // Filtre par promotion
  if (filters.promotion) {
    where.promotion = filters.promotion
  }

  // Filtre par année universitaire
  if (filters.anneeUniversitaire) {
    where.anneeUniversitaire = filters.anneeUniversitaire
  }

  const stages = await prisma.stage.findMany({
    where,
    include: {
      entreprise: {
        select: {
          id: true,
          nom: true
        }
      },
      etudiant: {
        select: {
          id: true,
          nom: true,
          prenom: true
        }
      },
      tuteur: {
        select: {
          id: true,
          nom: true,
          prenom: true
        }
      }
    },
    orderBy: [
      { promotion: 'desc' },
      { anneeUniversitaire: 'desc' },
      { dateDebut: 'desc' }
    ]
  })

  return stages.map(stage => ({
    id: stage.id,
    sujet: stage.sujet,
    description: stage.description,
    dateDebut: stage.dateDebut,
    dateFin: stage.dateFin,
    statut: stage.statut,
    promotion: stage.promotion,
    anneeUniversitaire: stage.anneeUniversitaire,
    departement: stage.departement,
    entreprise: stage.entreprise,
    etudiant: stage.etudiant,
    tuteur: stage.tuteur
  }))
}

