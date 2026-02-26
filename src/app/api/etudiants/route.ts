import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/error-handler'
import { etudiantSchema } from '@/lib/validations'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const departement = searchParams.get('departement') || 'INFO' // Département par défaut
    const hasTuteur = searchParams.get('hasTuteur') // 'true' pour avec tuteur, 'false' pour sans tuteur
    const promotion = searchParams.get('promotion') // '1', '2', ou '3'
    const anneeUniversitaire = searchParams.get('anneeUniversitaire') // '2024-2025', '2025-2026', etc.

    const where: any = {
      departement: departement
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtre par présence de tuteur (via stages)
    // Ce filtre sera appliqué après la récupération car il nécessite de vérifier les stages

    // Filtre par promotion
    if (promotion) {
      where.promotion = parseInt(promotion)
    }

    // Filtre par année universitaire
    if (anneeUniversitaire) {
      where.anneeUniversitaire = anneeUniversitaire
    }

    // Récupérer tous les étudiants avec leurs stages pour compter et filtrer
    const allEtudiants = await prisma.etudiant.findMany({
      include: {
        stages: {
          select: {
            id: true,
            promotion: true,
            anneeUniversitaire: true,
            statut: true,
            dateDebut: true,
            createdAt: true,
            idTuteur: true,
            tuteur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                entreprise: {
                  select: {
                    id: true,
                    nom: true
                  }
                }
              }
            }
          },
          orderBy: [
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: {
            stages: true
          }
        }
      },
      where
    })

    // Regrouper les étudiants par nom et prénom (insensible à la casse)
    // Garder uniquement la ligne la plus récente mais additionner tous les stages
    const etudiantsMap = new Map<string, typeof allEtudiants[0] & { totalStages: number; allStages: typeof allEtudiants[0]['stages'] }>()

    for (const etudiant of allEtudiants) {
      const key = `${etudiant.nom.toLowerCase()}_${etudiant.prenom.toLowerCase()}`
      
      if (!etudiantsMap.has(key)) {
        // Premier étudiant avec ce nom/prénom
        etudiantsMap.set(key, {
          ...etudiant,
          totalStages: etudiant._count.stages,
          allStages: [...etudiant.stages]
        })
      } else {
        const existing = etudiantsMap.get(key)!
        
        // Fusionner les stages (éviter les doublons par ID)
        const existingStageIds = new Set(existing.allStages.map(s => s.id))
        const newStages = etudiant.stages.filter(s => !existingStageIds.has(s.id))
        existing.allStages = [...existing.allStages, ...newStages]
        
        // Additionner le nombre de stages
        existing.totalStages = existing.totalStages + etudiant._count.stages
        
        // Déterminer quel étudiant garder (le plus récent)
        const existingPromotion = existing.promotion || 0
        const currentPromotion = etudiant.promotion || 0
        
        // Si la promotion actuelle est plus élevée, remplacer
        if (currentPromotion > existingPromotion) {
          // Remplacer mais garder le total de stages et fusionner les stages
          const totalStages = existing.totalStages
          const allStages = existing.allStages
          etudiantsMap.set(key, {
            ...etudiant,
            totalStages,
            allStages
          })
        } else if (currentPromotion === existingPromotion) {
          // Si même promotion, comparer les années universitaires
          const existingAnnee = existing.anneeUniversitaire || ''
          const currentAnnee = etudiant.anneeUniversitaire || ''
          
          if (currentAnnee > existingAnnee) {
            // Remplacer mais garder le total de stages et fusionner les stages
            const totalStages = existing.totalStages
            const allStages = existing.allStages
            etudiantsMap.set(key, {
              ...etudiant,
              totalStages,
              allStages
            })
          }
        }
        // Si existing est plus récent, on garde existing (ne rien faire)
      }
    }

    // Convertir la Map en tableau
    const etudiantsWithStages = Array.from(etudiantsMap.values())
    
    // Mettre à jour la promotion et l'année universitaire à partir du dernier stage actif
    // AVANT d'appliquer les filtres pour que les filtres utilisent la promotion mise à jour
    const etudiantsMapped = etudiantsWithStages.map((etudiant) => {
      const { allStages, totalStages, ...e } = etudiant
      // Trouver le dernier stage actif (statut = 'ACTIF')
      const stagesActifs = allStages.filter((s: any) => s.statut === 'ACTIF')
      let dernierStageActif = null
      
      if (stagesActifs.length > 0) {
        // Trier par date de création décroissante pour avoir le plus récent
        stagesActifs.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        dernierStageActif = stagesActifs[0]
      } else if (allStages.length > 0) {
        // Si aucun stage actif, prendre le dernier stage (déjà trié par createdAt desc)
        dernierStageActif = allStages[0]
      }
      
      // Utiliser la promotion et l'année du dernier stage actif si disponible
      const promotion = dernierStageActif?.promotion ?? e.promotion
      const anneeUniversitaire = dernierStageActif?.anneeUniversitaire ?? e.anneeUniversitaire
      
      return {
        ...e,
        promotion,
        anneeUniversitaire,
        _count: {
          stages: totalStages
        }
      }
    })
    
    let etudiants: typeof allEtudiants = etudiantsMapped as typeof allEtudiants
    
    // Appliquer les filtres promotion et année universitaire après la mise à jour
    if (promotion) {
      const promoNum = parseInt(promotion)
      etudiants = etudiants.filter(e => {
        // Vérifier si la promotion mise à jour correspond
        return e.promotion === promoNum
      })
    }
    
    if (anneeUniversitaire) {
      etudiants = etudiants.filter(e => {
        // Vérifier si l'année mise à jour correspond
        return e.anneeUniversitaire === anneeUniversitaire
      })
    }

    // Appliquer le filtre par présence de tuteur (via stages actifs)
    if (hasTuteur === 'true') {
      etudiants = etudiants.filter(e => {
        // Vérifier si l'étudiant a au moins un stage actif avec un tuteur
        return e.stages.some(s => s.statut === 'ACTIF' && s.idTuteur !== null)
      })
    } else if (hasTuteur === 'false') {
      etudiants = etudiants.filter(e => {
        // Vérifier si l'étudiant n'a aucun stage actif avec un tuteur
        return !e.stages.some(s => s.statut === 'ACTIF' && s.idTuteur !== null)
      })
    }

    // Trier par promotion décroissante, puis année universitaire décroissante, puis nom
    etudiants.sort((a, b) => {
      const promoA = a.promotion || 0
      const promoB = b.promotion || 0
      
      if (promoB !== promoA) {
        return promoB - promoA // Promotion décroissante
      }
      
      const anneeA = a.anneeUniversitaire || ''
      const anneeB = b.anneeUniversitaire || ''
      
      if (anneeB !== anneeA) {
        return anneeB.localeCompare(anneeA) // Année décroissante
      }
      
      // En dernier, trier par nom
      return a.nom.localeCompare(b.nom)
    })

    return NextResponse.json(etudiants)
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la récupération des étudiants', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = etudiantSchema.parse(body)

    const promotionNum = validated.promotion != null
      ? (typeof validated.promotion === 'string' ? parseInt(validated.promotion, 10) : validated.promotion)
      : 2

    const etudiant = await prisma.etudiant.create({
      data: {
        nom: validated.nom,
        prenom: validated.prenom,
        email: validated.email || null,
        departement: validated.departement || 'INFO',
        promotion: promotionNum,
        anneeUniversitaire: validated.annee_universitaire || null
      }
    })

    return NextResponse.json(etudiant, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la création de l\'étudiant', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs requis' },
        { status: 400 }
      )
    }

    // Convertir les IDs en nombres si nécessaire
    const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id))

    if (numericIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs invalides' },
        { status: 400 }
      )
    }

    const result = await prisma.etudiant.deleteMany({
      where: {
        id: { in: numericIds }
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Aucun étudiant trouvé avec ces IDs' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la suppression des étudiants', 500)
  }
}

