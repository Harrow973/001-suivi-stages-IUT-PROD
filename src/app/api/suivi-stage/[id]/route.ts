import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FormulaireSuiviStage } from '@/types'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const idStage = parseInt(idParam)

    if (isNaN(idStage)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le stage existe
    const stage = await prisma.stage.findUnique({
      where: { id: idStage },
      include: {
        entreprise: {
          include: {
            tuteurs: true
          }
        },
        etudiant: true,
        tuteur: true
      }
    })

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer le référent de stage pour cette promotion/département/année universitaire
    let referentStage = null
    if (stage.departement && stage.promotion && stage.anneeUniversitaire) {
      referentStage = await prisma.referentStage.findUnique({
        where: {
          departement_promotion_anneeUniversitaire: {
            departement: stage.departement,
            promotion: stage.promotion,
            anneeUniversitaire: stage.anneeUniversitaire
          }
        },
        include: {
          enseignant: true
        }
      })
    }

    // Récupérer toutes les visites pour ce stage
    let visites: Awaited<ReturnType<typeof prisma.visiteSuiviStage.findMany>> = []
    try {
      visites = await prisma.visiteSuiviStage.findMany({
        where: { idStage },
        orderBy: [
          { numeroVisite: 'asc' }
        ]
      })
    } catch (_error) {
      // Si le modèle n'existe pas encore (client Prisma non régénéré), on retourne un tableau vide
      console.warn('visiteSuiviStage model not available yet, returning empty array')
      visites = []
    }

    // Récupérer la dernière visite (visite en cours) ou créer un formulaire vide
    const derniereVisite = visites.length > 0 ? visites[visites.length - 1] : null
    const formulaire = derniereVisite 
      ? (derniereVisite.donneesFormulaire as unknown as FormulaireSuiviStage)
      : {
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

    return NextResponse.json({ stage, formulaire, referentStage, visites })
  } catch (error) {
    console.error('Error fetching suivi stage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du suivi de stage' },
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
    const idStage = parseInt(idParam)

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

    const body = await request.json()
    const formulaire: FormulaireSuiviStage = {
      idStage,
      suiviStagiaire: body.suiviStagiaire || {
        autoEvaluation: {}
      },
      suiviTuteurEntreprise: body.suiviTuteurEntreprise || {
        comportementSavoirEtre: {},
        competencesProfessionnelles: {},
        adequationStage: {}
      },
      suiviTuteurPedagogique: body.suiviTuteurPedagogique || {
        informationsVisite: {
          presents: {}
        },
        verificationCadrePedagogique: {},
        validationPeriode: {}
      },
      updatedAt: new Date().toISOString()
    }

    // Trouver la dernière visite ou créer une nouvelle
    let derniereVisite = null
    try {
      derniereVisite = await prisma.visiteSuiviStage.findFirst({
        where: { idStage },
        orderBy: { numeroVisite: 'desc' }
      })
    } catch (_error) {
      console.warn('visiteSuiviStage model not available yet')
    }

    if (derniereVisite) {
      // Mettre à jour la dernière visite
      try {
        await prisma.visiteSuiviStage.update({
          where: {
            idStage_numeroVisite: {
              idStage,
              numeroVisite: derniereVisite.numeroVisite
            }
          },
          data: {
            donneesFormulaire: formulaire as any
          }
        })
      } catch (error: any) {
        if (error.message?.includes('visiteSuiviStage') || error.message?.includes('undefined')) {
          return NextResponse.json(
            { error: 'Le modèle de visite n\'est pas encore disponible. Veuillez redémarrer le serveur Next.js.' },
            { status: 503 }
          )
        }
        throw error
      }
    } else {
      // Créer une nouvelle visite (visite 1)
      try {
        await prisma.visiteSuiviStage.create({
          data: {
            idStage,
            numeroVisite: 1,
            donneesFormulaire: formulaire as any
          }
        })
      } catch (error: any) {
        if (error.message?.includes('visiteSuiviStage') || error.message?.includes('undefined')) {
          return NextResponse.json(
            { error: 'Le modèle de visite n\'est pas encore disponible. Veuillez redémarrer le serveur Next.js.' },
            { status: 503 }
          )
        }
        throw error
      }
    }

    return NextResponse.json({ success: true, formulaire })
  } catch (error) {
    console.error('Error saving suivi stage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du suivi de stage' },
      { status: 500 }
    )
  }
}

