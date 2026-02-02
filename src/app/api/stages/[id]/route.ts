import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stageSchema } from '@/lib/validations'
import { z } from 'zod'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer le stage avec toutes ses relations
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: {
        entreprise: true,
        etudiant: true,
        tuteur: {
          include: {
            entreprise: true
          }
        }
      }
    })

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(stage)
  } catch (error) {
    console.error('Error fetching stage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du stage' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validation avec Zod
    const validatedData = stageSchema.parse({
      ...body,
      id_entreprise: body.id_entreprise || null,
      id_etudiant: body.id_etudiant || null,
      id_tuteur: body.id_tuteur || null
    })

    // Convertir les dates
    const dateDebut = new Date(validatedData.date_debut)
    const dateFin = new Date(validatedData.date_fin)

    // Vérifier que le stage existe
    const existingStage = await prisma.stage.findUnique({
      where: { id }
    })

    if (!existingStage) {
      return NextResponse.json(
        { error: 'Stage non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le stage
    const promotionValue = validatedData.promotion ? parseInt(validatedData.promotion) : null
    const anneeUniversitaireValue = validatedData.annee_universitaire || null

    const updatedStage = await prisma.stage.update({
      where: { id },
      data: {
        sujet: validatedData.sujet,
        description: validatedData.description,
        dateDebut,
        dateFin,
        statut: validatedData.statut || existingStage.statut,
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

    return NextResponse.json(updatedStage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating stage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du stage' },
      { status: 500 }
    )
  }
}

