import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FormulaireSuiviStage } from '@/types'

// GET : Récupérer toutes les visites pour un stage
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idStage = parseInt(id)

    if (isNaN(idStage)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    let visites: Awaited<ReturnType<typeof prisma.visiteSuiviStage.findMany>> = []
    try {
      visites = await prisma.visiteSuiviStage.findMany({
        where: { idStage },
        orderBy: [
          { numeroVisite: 'asc' }
        ]
      })
    } catch (error) {
      // Si le modèle n'existe pas encore (client Prisma non régénéré), on retourne un tableau vide
      console.warn('visiteSuiviStage model not available yet, returning empty array')
      visites = []
    }

    return NextResponse.json(visites)
  } catch (error) {
    console.error('Error fetching visites:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des visites' },
      { status: 500 }
    )
  }
}

// POST : Créer une nouvelle visite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idStage = parseInt(id)

    if (isNaN(idStage)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le stage existe
    const stage = await prisma.stage.findUnique({
      where: { id: idStage }
    })

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage non trouvé' },
        { status: 404 }
      )
    }

    // Trouver le prochain numéro de visite
    let dernierVisite = null
    try {
      dernierVisite = await prisma.visiteSuiviStage.findFirst({
        where: { idStage },
        orderBy: { numeroVisite: 'desc' }
      })
    } catch (_error) {
      // Si le modèle n'existe pas encore (client Prisma non régénéré), on commence à 1
      console.warn('visiteSuiviStage model not available yet, starting at visit 1')
    }

    const numeroVisite = dernierVisite ? dernierVisite.numeroVisite + 1 : 1

    const body = await request.json()
    const formulaire: FormulaireSuiviStage = body.formulaire || {
      idStage,
      suiviStagiaire: {
        autoEvaluation: {}
      },
      suiviTuteurEntreprise: {
        comportementSavoirEtre: {},
        competencesProfessionnelles: {},
        adequationStage: {}
      },
      suiviTuteurPedagogique: {
        informationsVisite: {
          presents: {}
        },
        verificationCadrePedagogique: {},
        validationPeriode: {}
      }
    }

    let visite
    try {
      visite = await prisma.visiteSuiviStage.create({
        data: {
          idStage,
          numeroVisite,
          dateVisite: body.dateVisite ? new Date(body.dateVisite) : null,
          donneesFormulaire: formulaire as any
        }
      })
    } catch (error: any) {
      // Si le modèle n'existe pas encore, retourner une erreur explicite
      if (error.message?.includes('visiteSuiviStage') || error.message?.includes('undefined')) {
        return NextResponse.json(
          { error: 'Le modèle de visite n\'est pas encore disponible. Veuillez redémarrer le serveur Next.js.' },
          { status: 503 }
        )
      }
      throw error
    }

    return NextResponse.json(visite, { status: 201 })
  } catch (error) {
    console.error('Error creating visite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la visite' },
      { status: 500 }
    )
  }
}

