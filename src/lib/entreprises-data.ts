/**
 * Fonctions utilitaires pour récupérer les entreprises depuis Prisma
 * Utilisées par les Server Components
 */

import { prisma } from '@/lib/prisma'
import { Departement } from '@/generated/enums'

export interface EntrepriseFilters {
  departement: Departement
  search?: string
  active?: boolean
}

export interface EntrepriseWithCount {
  id: number
  nom: string
  adresse: string | null
  secteur: string | null
  telephone: string | null
  email: string | null
  _count: {
    stages: number
    tuteurs: number
  }
}

/**
 * Récupère les entreprises avec filtres
 */
export async function getEntreprises(filters: EntrepriseFilters): Promise<EntrepriseWithCount[]> {
  const where: any = {
    departement: filters.departement
  }

  // Filtre par recherche
  if (filters.search) {
    where.OR = [
      { nom: { contains: filters.search, mode: 'insensitive' } },
      { secteur: { contains: filters.search, mode: 'insensitive' } },
      { adresse: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  // Filtre pour entreprises actives (avec stages actifs)
  if (filters.active) {
    where.stages = {
      some: {
        statut: 'ACTIF'
      }
    }
  }

  const entreprises = await prisma.entreprise.findMany({
    include: {
      _count: {
        select: {
          stages: true,
          tuteurs: true
        }
      }
    },
    where,
    orderBy: { nom: 'asc' }
  })

  return entreprises.map(entreprise => ({
    id: entreprise.id,
    nom: entreprise.nom,
    adresse: entreprise.adresse,
    secteur: entreprise.secteur,
    telephone: entreprise.telephone,
    email: entreprise.email,
    _count: entreprise._count
  }))
}

