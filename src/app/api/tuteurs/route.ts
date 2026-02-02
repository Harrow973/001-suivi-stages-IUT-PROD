import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const departement = searchParams.get('departement') || 'INFO' // Département par défaut
    const active = searchParams.get('active') === 'true' // Filtre pour tuteurs actifs

    const where: any = {
      departement: departement
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { entreprise: { nom: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Filtre pour tuteurs actifs (avec étudiants ou stages)
    // Note: On filtre après la récupération car Prisma ne supporte pas bien OR avec some
    // On récupère tous les tuteurs et on filtre côté serveur

    let tuteurs = await prisma.tuteur.findMany({
      include: {
        entreprise: true,
        _count: {
          select: {
            stages: true
          }
        }
      },
      where,
      orderBy: { nom: 'asc' }
    })

    // Filtre pour tuteurs actifs (avec stages)
    if (active) {
      tuteurs = tuteurs.filter(tuteur => 
        tuteur._count.stages > 0
      )
    }

    return NextResponse.json(tuteurs)
  } catch (error) {
    console.error('Error fetching tuteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tuteurs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const tuteur = await prisma.tuteur.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        telephone: body.telephone || null,
        email: body.email || null,
        idEntreprise: body.id_entreprise || null,
        departement: body.departement || 'INFO'
      },
      include: {
        entreprise: true
      }
    })

    return NextResponse.json(tuteur, { status: 201 })
  } catch (error) {
    console.error('Error creating tuteur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du tuteur' },
      { status: 500 }
    )
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

    await prisma.tuteur.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tuteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
