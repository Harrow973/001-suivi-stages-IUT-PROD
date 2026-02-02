import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { entrepriseSchema } from '@/lib/validations'
import { z } from 'zod'

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

    // Récupérer l'entreprise avec toutes ses relations
    const entreprise = await prisma.entreprise.findUnique({
      where: { id },
      include: {
        tuteurs: {
          include: {
            _count: {
              select: {
                stages: true
              }
            }
          }
        },
        _count: {
          select: {
            tuteurs: true,
            stages: true
          }
        }
      }
    })

    if (!entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer les IDs des tuteurs de cette entreprise
    const tuteursIds = entreprise.tuteurs.map(t => t.id)

    // Récupérer uniquement les stages dont le tuteur appartient à cette entreprise
    // On filtre par les IDs des tuteurs pour s'assurer que le tuteur appartient bien à l'entreprise
    const stages = await prisma.stage.findMany({
      where: {
        idTuteur: {
          in: tuteursIds.length > 0 ? tuteursIds : [-1] // Si aucun tuteur, retourner un tableau vide
        }
      },
      include: {
        etudiant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            promotion: true,
            anneeUniversitaire: true
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
      orderBy: {
        dateDebut: 'desc'
      }
    })

    // Compter les stages pour mettre à jour le _count
    const stagesCount = stages.length

    return NextResponse.json({
      ...entreprise,
      stages,
      _count: {
        ...entreprise._count,
        stages: stagesCount
      }
    })
  } catch (error) {
    console.error('Error fetching entreprise:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'entreprise' },
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
    const validatedData = entrepriseSchema.parse(body)

    // Vérifier que l'entreprise existe
    const existingEntreprise = await prisma.entreprise.findUnique({
      where: { id }
    })

    if (!existingEntreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour l'entreprise
    const updatedEntreprise = await prisma.entreprise.update({
      where: { id },
      data: {
        nom: validatedData.nom,
        adresse: validatedData.adresse || null,
        secteur: validatedData.secteur || null,
        telephone: validatedData.telephone || null,
        email: validatedData.email || null,
        siret: validatedData.siret || null,
        tailleEntreprise: validatedData.tailleEntreprise || null,
        estActive: validatedData.estActive !== undefined ? validatedData.estActive : true
      }
    })

    return NextResponse.json(updatedEntreprise)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating entreprise:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entreprise' },
      { status: 500 }
    )
  }
}

