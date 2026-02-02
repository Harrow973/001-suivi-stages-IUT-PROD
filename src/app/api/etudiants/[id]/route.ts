import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { etudiantSchema } from '@/lib/validations'
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

    // Récupérer l'étudiant principal
    const etudiant = await prisma.etudiant.findUnique({
      where: { id }
    })

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer tous les étudiants avec le même nom et prénom (insensible à la casse)
    const etudiantsSimilaires = await prisma.etudiant.findMany({
      where: {
        nom: { equals: etudiant.nom, mode: 'insensitive' },
        prenom: { equals: etudiant.prenom, mode: 'insensitive' },
        departement: etudiant.departement
      },
      select: {
        id: true
      }
    })

    const idsEtudiants = etudiantsSimilaires.map(e => e.id)

    // Récupérer tous les stages de tous les étudiants avec le même nom/prénom
    const tousLesStages = await prisma.stage.findMany({
      where: {
        idEtudiant: { in: idsEtudiants }
      },
      include: {
        entreprise: true,
        tuteur: {
          include: {
            entreprise: true
          }
        }
      },
      orderBy: [
        { promotion: 'desc' },
        { anneeUniversitaire: 'desc' },
        { dateDebut: 'desc' }
      ]
    })

    // Organiser les stages par promotion
    const stagesParPromotion: Record<number, typeof tousLesStages> = {
      1: [],
      2: [],
      3: []
    }

    tousLesStages.forEach(stage => {
      if (stage.promotion && stage.promotion >= 1 && stage.promotion <= 3) {
        stagesParPromotion[stage.promotion].push(stage)
      }
    })

    // Trouver l'étudiant avec la promotion la plus récente pour l'affichage
    const etudiantPrincipal = await prisma.etudiant.findFirst({
      where: {
        nom: { equals: etudiant.nom, mode: 'insensitive' },
        prenom: { equals: etudiant.prenom, mode: 'insensitive' },
        departement: etudiant.departement
      },
      orderBy: [
        { promotion: 'desc' },
        { anneeUniversitaire: 'desc' }
      ]
    })

    // Récupérer le tuteur du dernier stage (le plus récent)
    const dernierStage = tousLesStages.length > 0 ? tousLesStages[0] : null
    const tuteurDernierStage = dernierStage?.tuteur ? {
      id: dernierStage.tuteur.id,
      nom: dernierStage.tuteur.nom,
      prenom: dernierStage.tuteur.prenom,
      telephone: dernierStage.tuteur.telephone,
      email: dernierStage.tuteur.email,
      entreprise: dernierStage.tuteur.entreprise ? {
        id: dernierStage.tuteur.entreprise.id,
        nom: dernierStage.tuteur.entreprise.nom
      } : null
    } : null

    return NextResponse.json({
      ...(etudiantPrincipal || etudiant),
      tuteur: tuteurDernierStage,
      stages: tousLesStages,
      stagesParPromotion
    })
  } catch (error) {
    console.error('Error fetching etudiant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'étudiant' },
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
    const validatedData = etudiantSchema.parse(body)

    // Vérifier que l'étudiant existe
    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { id }
    })

    if (!existingEtudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour l'étudiant
    const promotionValue = validatedData.promotion && validatedData.promotion !== 'none' ? parseInt(validatedData.promotion) : null
    const anneeUniversitaireValue = validatedData.annee_universitaire || null

    const updatedEtudiant = await prisma.etudiant.update({
      where: { id },
      data: {
        nom: validatedData.nom,
        prenom: validatedData.prenom,
        email: validatedData.email || null,
        promotion: promotionValue,
        anneeUniversitaire: anneeUniversitaireValue
      }
    })

    return NextResponse.json(updatedEtudiant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating etudiant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'étudiant' },
      { status: 500 }
    )
  }
}

