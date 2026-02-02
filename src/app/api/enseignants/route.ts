import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const departement = searchParams.get('departement') || 'INFO'

    const where: any = {
      departement: departement
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const enseignants = await prisma.enseignant.findMany({
      where,
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json(enseignants)
  } catch (error) {
    console.error('Error fetching enseignants:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des enseignants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const enseignant = await prisma.enseignant.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        telephone: body.telephone || null,
        email: body.email || null,
        departement: body.departement || 'INFO'
      }
    })

    return NextResponse.json(enseignant, { status: 201 })
  } catch (error) {
    console.error('Error creating enseignant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'enseignant' },
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

    await prisma.enseignant.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting enseignants:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

