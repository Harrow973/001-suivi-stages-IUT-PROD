import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FormulaireSuiviStage } from '@/types'

// GET : Récupérer une visite spécifique
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; numero: string }> }
) {
  try {
    const { id, numero } = await params
    const idStage = parseInt(id)
    const numeroVisite = parseInt(numero)

    if (isNaN(idStage) || isNaN(numeroVisite)) {
      return NextResponse.json(
        { error: 'ID ou numéro invalide' },
        { status: 400 }
      )
    }

    let visite
    try {
      visite = await prisma.visiteSuiviStage.findUnique({
        where: {
          idStage_numeroVisite: {
            idStage,
            numeroVisite
          }
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

    if (!visite) {
      return NextResponse.json(
        { error: 'Visite non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(visite)
  } catch (error) {
    console.error('Error fetching visite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la visite' },
      { status: 500 }
    )
  }
}

// PUT : Mettre à jour une visite
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; numero: string }> }
) {
  try {
    const { id, numero } = await params
    const idStage = parseInt(id)
    const numeroVisite = parseInt(numero)

    if (isNaN(idStage) || isNaN(numeroVisite)) {
      return NextResponse.json(
        { error: 'ID ou numéro invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const formulaire: FormulaireSuiviStage = body.formulaire

    let visite
    try {
      visite = await prisma.visiteSuiviStage.update({
        where: {
          idStage_numeroVisite: {
            idStage,
            numeroVisite
          }
        },
        data: {
          dateVisite: body.dateVisite ? new Date(body.dateVisite) : undefined,
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

    return NextResponse.json(visite)
  } catch (error) {
    console.error('Error updating visite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la visite' },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer une visite
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; numero: string }> }
) {
  try {
    const { id, numero } = await params
    const idStage = parseInt(id)
    const numeroVisite = parseInt(numero)

    if (isNaN(idStage) || isNaN(numeroVisite)) {
      return NextResponse.json(
        { error: 'ID ou numéro invalide' },
        { status: 400 }
      )
    }

    try {
      await prisma.visiteSuiviStage.delete({
        where: {
          idStage_numeroVisite: {
            idStage,
            numeroVisite
          }
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting visite:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la visite' },
      { status: 500 }
    )
  }
}

