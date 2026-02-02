/**
 * Fonction utilitaire pour récupérer les statistiques du dashboard
 * Utilisée par les Server Components pour éviter les appels API inutiles
 */

import { prisma } from '@/lib/prisma'
import { Departement } from '@/generated/enums'

export type DashboardStats = {
  stages: {
    total: number
    actifs: number
    termines: number
  }
  entreprises: {
    total: number
    actives: number
  }
  etudiants: {
    total: number
    avecTuteur: number
    sansTuteur: number
  }
  tuteurs: {
    total: number
    actifs: number
  }
  stagesRecents: Array<{
    id: number
    sujet: string
    statut: string
    dateDebut: Date
    dateFin: Date
    entreprise: { nom: string } | null
    etudiant: { nom: string; prenom: string } | null
    tuteur: { nom: string; prenom: string } | null
  }>
}

/**
 * Récupère les statistiques du dashboard pour un département donné
 */
export async function getDashboardStats(
  departement: Departement
): Promise<DashboardStats> {
  // Récupérer les statistiques pour le département
  const [
    totalStages,
    stagesActifs,
    stagesTermines,
    totalEntreprises,
    entreprisesActives,
    totalEtudiants,
    etudiantsAvecTuteur,
    etudiantsSansTuteur,
    totalTuteurs,
    tuteursActifs
  ] = await Promise.all([
    // Stages
    prisma.stage.count({
      where: { departement }
    }),
    prisma.stage.count({
      where: { departement, statut: 'ACTIF' }
    }),
    prisma.stage.count({
      where: { departement, statut: 'TERMINE' }
    }),
    // Entreprises
    prisma.entreprise.count({
      where: { departement }
    }),
    prisma.entreprise.count({
      where: {
        departement,
        stages: {
          some: {
            statut: 'ACTIF'
          }
        }
      }
    }),
    // Étudiants
    prisma.etudiant.count({
      where: { departement }
    }),
    // Étudiants avec tuteur (via stages actifs)
    prisma.stage.findMany({
      where: { 
        departement, 
        statut: 'ACTIF',
        idTuteur: { not: null },
        idEtudiant: { not: null }
      },
      distinct: ['idEtudiant'],
      select: { idEtudiant: true }
    }).then(stages => stages.length),
    // Étudiants sans tuteur (étudiants sans stage actif avec tuteur)
    prisma.etudiant.count({
      where: { 
        departement,
        stages: {
          none: {
            statut: 'ACTIF',
            idTuteur: { not: null }
          }
        }
      }
    }),
    // Tuteurs
    prisma.tuteur.count({
      where: { departement }
    }),
    // Tuteurs actifs (filtrés après récupération)
    prisma.tuteur.findMany({
      where: { departement },
      include: {
        _count: {
          select: {
            stages: true
          }
        }
      }
    })
  ])

  // Récupérer les stages récents (5 derniers)
  const stagesRecents = await prisma.stage.findMany({
    where: { departement },
    include: {
      entreprise: {
        select: {
          nom: true
        }
      },
      etudiant: {
        select: {
          nom: true,
          prenom: true
        }
      },
      tuteur: {
        select: {
          nom: true,
          prenom: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Filtrer les tuteurs actifs
  const tuteursActifsCount = tuteursActifs.filter(
    (tuteur) => tuteur._count.stages > 0
  ).length

  return {
    stages: {
      total: totalStages,
      actifs: stagesActifs,
      termines: stagesTermines
    },
    entreprises: {
      total: totalEntreprises,
      actives: entreprisesActives
    },
    etudiants: {
      total: totalEtudiants,
      avecTuteur: etudiantsAvecTuteur,
      sansTuteur: etudiantsSansTuteur
    },
    tuteurs: {
      total: totalTuteurs,
      actifs: tuteursActifsCount
    },
    stagesRecents: stagesRecents.map(stage => ({
      id: stage.id,
      sujet: stage.sujet,
      statut: stage.statut,
      dateDebut: stage.dateDebut,
      dateFin: stage.dateFin,
      entreprise: stage.entreprise,
      etudiant: stage.etudiant,
      tuteur: stage.tuteur
    }))
  }
}

