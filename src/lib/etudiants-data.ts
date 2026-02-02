/**
 * Fonctions utilitaires pour récupérer les étudiants depuis Prisma
 * Utilisées par les Server Components
 * 
 * Note: La logique de regroupement par nom/prénom est conservée
 * car elle est spécifique au domaine métier
 */

import { prisma } from '@/lib/prisma'
import { Departement } from '@/generated/enums'

export interface EtudiantFilters {
  departement: Departement
  search?: string
  hasTuteur?: boolean
  promotion?: number
  anneeUniversitaire?: string
}

export interface EtudiantWithRelations {
  id: number
  nom: string
  prenom: string
  email: string | null
  promotion: number | null
  anneeUniversitaire: string | null
  departement: Departement
  tuteur: {
    id: number
    nom: string
    prenom: string
    entreprise: {
      id: number
      nom: string
    } | null
  } | null
  _count: {
    stages: number
  }
}

/**
 * Récupère les étudiants avec filtres
 * Gère le regroupement par nom/prénom comme dans l'API originale
 */
export async function getEtudiants(filters: EtudiantFilters): Promise<EtudiantWithRelations[]> {
  const where: {
    departement: Departement
    OR?: Array<{
      nom?: { contains: string; mode: 'insensitive' }
      prenom?: { contains: string; mode: 'insensitive' }
      email?: { contains: string; mode: 'insensitive' }
    }>
    promotion?: number
    anneeUniversitaire?: string
  } = {
    departement: filters.departement
  }

  // Filtre par recherche
  if (filters.search) {
    where.OR = [
      { nom: { contains: filters.search, mode: 'insensitive' } },
      { prenom: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  // Filtre par promotion
  if (filters.promotion) {
    where.promotion = filters.promotion
  }

  // Filtre par année universitaire
  if (filters.anneeUniversitaire) {
    where.anneeUniversitaire = filters.anneeUniversitaire
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
  const etudiantsMap = new Map<string, typeof allEtudiants[0] & { totalStages: number; allStages: typeof allEtudiants[0]['stages'] }>()

  for (const etudiant of allEtudiants) {
    const key = `${etudiant.nom.toLowerCase()}_${etudiant.prenom.toLowerCase()}`
    
    if (!etudiantsMap.has(key)) {
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
      
      if (currentPromotion > existingPromotion) {
        const totalStages = existing.totalStages
        const allStages = existing.allStages
        etudiantsMap.set(key, {
          ...etudiant,
          totalStages,
          allStages
        })
      } else if (currentPromotion === existingPromotion) {
        const existingAnnee = existing.anneeUniversitaire || ''
        const currentAnnee = etudiant.anneeUniversitaire || ''
        
        if (currentAnnee > existingAnnee) {
          const totalStages = existing.totalStages
          const allStages = existing.allStages
          etudiantsMap.set(key, {
            ...etudiant,
            totalStages,
            allStages
          })
        }
      }
    }
  }

  // Convertir la Map en tableau
  const etudiantsWithStages = Array.from(etudiantsMap.values())
  
  // Mettre à jour la promotion et l'année universitaire à partir du dernier stage actif
  const etudiantsMapped = etudiantsWithStages.map((etudiant) => {
    const { allStages, totalStages, ...e } = etudiant
    type StageType = {
      id: number
      statut: string
      createdAt: Date | null
      promotion: number | null
      anneeUniversitaire: string | null
      tuteur: {
        id: number
        nom: string
        prenom: string
        entreprise: { id: number; nom: string } | null
      } | null
    }
    const stagesActifs = allStages.filter((s: StageType) => s.statut === 'ACTIF')
    let dernierStageActif: StageType | null = null
    
    if (stagesActifs.length > 0) {
      stagesActifs.sort((a: StageType, b: StageType) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      dernierStageActif = stagesActifs[0]
    } else if (allStages.length > 0) {
      dernierStageActif = allStages[0] as StageType
    }
    
    const promotion = dernierStageActif?.promotion ?? e.promotion
    const anneeUniversitaire = dernierStageActif?.anneeUniversitaire ?? e.anneeUniversitaire
    
    // Trouver le tuteur du dernier stage actif
    const tuteur = dernierStageActif?.tuteur || null
    
    return {
      ...e,
      promotion,
      anneeUniversitaire,
      tuteur,
      _count: {
        stages: totalStages
      }
    }
  })
  
  let etudiants: EtudiantWithRelations[] = etudiantsMapped as EtudiantWithRelations[]
  
  // Appliquer les filtres promotion et année universitaire après la mise à jour
  if (filters.promotion) {
    const promoNum = filters.promotion
    etudiants = etudiants.filter(e => e.promotion === promoNum)
  }
  
  if (filters.anneeUniversitaire) {
    etudiants = etudiants.filter(e => e.anneeUniversitaire === filters.anneeUniversitaire)
  }

  // Appliquer le filtre par présence de tuteur (via stages actifs)
  if (filters.hasTuteur === true) {
    etudiants = etudiants.filter(e => {
      return e.tuteur !== null
    })
  } else if (filters.hasTuteur === false) {
    etudiants = etudiants.filter(e => {
      return e.tuteur === null
    })
  }

  // Trier par promotion décroissante, puis année universitaire décroissante, puis nom
  etudiants.sort((a, b) => {
    const promoA = a.promotion || 0
    const promoB = b.promotion || 0
    
    if (promoB !== promoA) {
      return promoB - promoA
    }
    
    const anneeA = a.anneeUniversitaire || ''
    const anneeB = b.anneeUniversitaire || ''
    
    if (anneeB !== anneeA) {
      return anneeB.localeCompare(anneeA)
    }
    
    return a.nom.localeCompare(b.nom)
  })

  return etudiants.map(etudiant => ({
    id: etudiant.id,
    nom: etudiant.nom,
    prenom: etudiant.prenom,
    email: etudiant.email,
    promotion: etudiant.promotion,
    anneeUniversitaire: etudiant.anneeUniversitaire,
    departement: etudiant.departement,
    tuteur: etudiant.tuteur,
    _count: etudiant._count
  }))
}

