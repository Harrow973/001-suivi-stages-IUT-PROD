import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Departement } from '@/generated/enums'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const departement = (searchParams.get('departement') || 'INFO') as Departement

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
        entreprise: true,
        etudiant: true,
        tuteur: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Filtrer les tuteurs actifs
    const tuteursActifsCount = tuteursActifs.filter(
      (tuteur: any) => tuteur._count.stages > 0
    ).length

    return NextResponse.json({
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
      stagesRecents
    })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la récupération des statistiques', 500)
  }
}

