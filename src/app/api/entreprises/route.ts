import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/error-handler'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const departement = searchParams.get('departement') || 'INFO' // Département par défaut
    const active = searchParams.get('active') === 'true' // Filtre pour entreprises actives

    const where: any = {
      departement: departement
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { secteur: { contains: search, mode: 'insensitive' } },
        { adresse: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtre pour entreprises actives (avec stages actifs)
    if (active) {
      where.stages = {
        some: {
          statut: 'ACTIF'
        }
      }
    }

    const entreprises = await prisma.entreprise.findMany({
      include: {
        _count: {
          select: {
            stages: true,
            tuteurs: true
          }
        }
      },
      where,
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(entreprises)
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la récupération des entreprises', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entreprise = await prisma.entreprise.create({
      data: {
        nom: body.nom,
        adresse: body.adresse || null,
        secteur: body.secteur || null,
        telephone: body.telephone || null,
        email: body.email || null,
        departement: body.departement || 'INFO'
      }
    })

    return NextResponse.json(entreprise, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la création de l\'entreprise', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs requis' },
        { status: 400 }
      )
    }

    // Convertir les IDs en nombres si nécessaire
    const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id))

    if (numericIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs invalides' },
        { status: 400 }
      )
    }

    const result = await prisma.entreprise.deleteMany({
      where: {
        id: { in: numericIds }
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Aucune entreprise trouvée avec ces IDs' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    return createErrorResponse(error, 'Erreur lors de la suppression des entreprises', 500)
  }
}

