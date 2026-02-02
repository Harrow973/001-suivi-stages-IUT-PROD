import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const referent = await prisma.referentStage.findUnique({
      where: { id: parseInt(id) },
      include: {
        enseignant: true
      }
    })

    if (!referent) {
      return NextResponse.json(
        { error: 'Référent non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(referent)
  } catch (error) {
    console.error('Error fetching referent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du référent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Vérifier que le référent existe
    const existingReferent = await prisma.referentStage.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReferent) {
      return NextResponse.json(
        { error: 'Référent non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'enseignant existe si fourni
    if (body.id_enseignant) {
      const enseignant = await prisma.enseignant.findUnique({
        where: { id: parseInt(body.id_enseignant) }
      })

      if (!enseignant) {
        return NextResponse.json(
          { error: 'L\'enseignant spécifié n\'existe pas' },
          { status: 404 }
        )
      }
    }

    // Mettre à jour le référent
    const referent = await prisma.referentStage.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.departement && { departement: body.departement }),
        ...(body.promotion && { promotion: parseInt(body.promotion) }),
        ...(body.annee_universitaire && { anneeUniversitaire: body.annee_universitaire }),
        ...(body.id_enseignant && { idEnseignant: parseInt(body.id_enseignant) })
      },
      include: {
        enseignant: true
      }
    })

    return NextResponse.json(referent)
  } catch (error: any) {
    console.error('Error updating referent:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un référent existe déjà pour cette combinaison département/promotion/année universitaire' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du référent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.referentStage.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting referent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

