import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const departement = searchParams.get('departement')
    const promotion = searchParams.get('promotion')
    const anneeUniversitaire = searchParams.get('annee_universitaire')

    const where: any = {}

    if (departement) {
      where.departement = departement
    }

    if (promotion) {
      where.promotion = parseInt(promotion)
    }

    if (anneeUniversitaire) {
      where.anneeUniversitaire = anneeUniversitaire
    }

    const referents = await prisma.referentStage.findMany({
      where,
      include: {
        enseignant: true
      },
      orderBy: [
        { departement: 'asc' },
        { promotion: 'asc' },
        { anneeUniversitaire: 'desc' }
      ]
    })

    return NextResponse.json(referents)
  } catch (error) {
    console.error('Error fetching referents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des référents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données
    if (!body.departement || !body.promotion || !body.annee_universitaire || !body.id_enseignant) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis (departement, promotion, annee_universitaire, id_enseignant)' },
        { status: 400 }
      )
    }

    // Vérifier que la promotion est valide (1, 2 ou 3)
    if (![1, 2, 3].includes(parseInt(body.promotion))) {
      return NextResponse.json(
        { error: 'La promotion doit être 1, 2 ou 3' },
        { status: 400 }
      )
    }

    // Vérifier que l'enseignant existe
    const enseignant = await prisma.enseignant.findUnique({
      where: { id: parseInt(body.id_enseignant) }
    })

    if (!enseignant) {
      return NextResponse.json(
        { error: 'L\'enseignant spécifié n\'existe pas' },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour le référent (grâce à l'unique constraint)
    const referent = await prisma.referentStage.upsert({
      where: {
        departement_promotion_anneeUniversitaire: {
          departement: body.departement,
          promotion: parseInt(body.promotion),
          anneeUniversitaire: body.annee_universitaire
        }
      },
      update: {
        idEnseignant: parseInt(body.id_enseignant)
      },
      create: {
        departement: body.departement,
        promotion: parseInt(body.promotion),
        anneeUniversitaire: body.annee_universitaire,
        idEnseignant: parseInt(body.id_enseignant)
      },
      include: {
        enseignant: true
      }
    })

    return NextResponse.json(referent, { status: 201 })
  } catch (error: any) {
    console.error('Error creating referent:', error)
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un référent existe déjà pour cette combinaison département/promotion/année universitaire' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du référent' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

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

