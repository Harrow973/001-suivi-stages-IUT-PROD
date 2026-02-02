import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stageSchema } from '@/lib/validations'
import { checkRateLimit, apiRateLimiter } from '@/lib/rate-limit'
import { createErrorResponse } from '@/lib/error-handler'
import type { Prisma } from '@/generated/client'
import { Departement, StatutStage } from '@/generated/enums'

// Route segment config - Les données changent fréquemment, donc on force le dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, apiRateLimiter)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const statut = searchParams.get('statut') // 'ACTIF', 'TERMINE', ou null pour tous
    const departement = searchParams.get('departement') || 'INFO' // Département par défaut
    const promotion = searchParams.get('promotion') // '1', '2', ou '3'
    const anneeUniversitaire = searchParams.get('anneeUniversitaire') // '2024-2025', '2025-2026', etc.

    const where: Prisma.StageWhereInput = {
      departement: departement as Departement
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { sujet: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { entreprise: { nom: { contains: search, mode: 'insensitive' } } },
        { etudiant: { nom: { contains: search, mode: 'insensitive' } } },
        { etudiant: { prenom: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Filtre par statut
    if (statut && (statut === 'ACTIF' || statut === 'TERMINE' || statut === 'ANNULE')) {
      where.statut = statut as StatutStage
    }

    // Filtre par promotion
    if (promotion) {
      where.promotion = parseInt(promotion)
    }

    // Filtre par année universitaire
    if (anneeUniversitaire) {
      where.anneeUniversitaire = anneeUniversitaire
    }

    const stages = await prisma.stage.findMany({
      include: {
        entreprise: true,
        etudiant: true,
        tuteur: true
      },
      where,
      orderBy: [
        { promotion: 'desc' },
        { anneeUniversitaire: 'desc' },
        { dateDebut: 'desc' }
      ]
    })

    return NextResponse.json(stages)
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la récupération des stages', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, apiRateLimiter)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    const body = await request.json()
    
    // Gérer l'ajout en cascade
    let entrepriseId = body.id_entreprise
    let etudiantId = body.id_etudiant
    let tuteurId = body.id_tuteur

    // Créer entreprise si nécessaire
    if (body.new_entreprise) {
      const entreprise = await prisma.entreprise.create({
        data: body.new_entreprise
      })
      entrepriseId = entreprise.id
    }

    // Créer étudiant si nécessaire
    if (body.new_etudiant) {
      const etudiant = await prisma.etudiant.create({
        data: {
          ...body.new_etudiant
        }
      })
      etudiantId = etudiant.id
    }

    // Créer tuteur si nécessaire
    if (body.new_tuteur) {
      const tuteur = await prisma.tuteur.create({
        data: {
          ...body.new_tuteur,
          idEntreprise: entrepriseId || undefined
        }
      })
      tuteurId = tuteur.id
    }

    // Validation avec Zod
    const validatedData = stageSchema.parse({
      ...body,
      id_entreprise: entrepriseId,
      id_etudiant: etudiantId,
      id_tuteur: tuteurId
    })

    // Récupérer l'étudiant pour hériter de promotion et anneeUniversitaire si non fournis
    let promotionValue = validatedData.promotion ? parseInt(validatedData.promotion) : null
    let anneeUniversitaireValue = validatedData.annee_universitaire || null

    if (validatedData.id_etudiant && (!promotionValue || !anneeUniversitaireValue)) {
      const etudiant = await prisma.etudiant.findUnique({
        where: { id: validatedData.id_etudiant },
        select: { promotion: true, anneeUniversitaire: true }
      })
      if (etudiant) {
        if (!promotionValue) promotionValue = etudiant.promotion
        if (!anneeUniversitaireValue) anneeUniversitaireValue = etudiant.anneeUniversitaire
      }
    }

    const stage = await prisma.stage.create({
      data: {
        sujet: validatedData.sujet,
        description: validatedData.description,
        dateDebut: new Date(validatedData.date_debut),
        dateFin: new Date(validatedData.date_fin),
        departement: validatedData.departement || 'INFO',
        promotion: promotionValue,
        anneeUniversitaire: anneeUniversitaireValue,
        idEntreprise: validatedData.id_entreprise || null,
        idEtudiant: validatedData.id_etudiant || null,
        idTuteur: validatedData.id_tuteur || null
      },
      include: {
        entreprise: true,
        etudiant: true,
        tuteur: true
      }
    })

    return NextResponse.json(stage, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la création du stage', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, apiRateLimiter)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs requis' },
        { status: 400 }
      )
    }

    await prisma.stage.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la suppression des stages', 500)
  }
}

