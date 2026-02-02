import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Vérifier que l'enseignant existe
    const existingEnseignant = await prisma.enseignant.findUnique({
      where: { id }
    })

    if (!existingEnseignant) {
      return NextResponse.json(
        { error: 'Enseignant non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour l'enseignant
    const updatedEnseignant = await prisma.enseignant.update({
      where: { id },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        telephone: body.telephone || null,
        email: body.email || null,
        departement: body.departement || 'INFO'
      }
    })

    return NextResponse.json(updatedEnseignant)
  } catch (error) {
    console.error('Error updating enseignant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'enseignant' },
      { status: 500 }
    )
  }
}

