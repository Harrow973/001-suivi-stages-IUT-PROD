import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tuteurSchema } from '@/lib/validations'
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

    // Récupérer le tuteur avec toutes ses relations
    const tuteur = await prisma.tuteur.findUnique({
      where: { id },
      include: {
        entreprise: true,
        stages: {
          include: {
            etudiant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                promotion: true,
                anneeUniversitaire: true,
                _count: {
                  select: {
                    stages: true
                  }
                }
              }
            },
            entreprise: {
              select: {
                id: true,
                nom: true
              }
            }
          },
          orderBy: {
            dateDebut: 'desc'
          }
        },
        _count: {
          select: {
            stages: true
          }
        }
      }
    })

    if (!tuteur) {
      return NextResponse.json(
        { error: 'Tuteur non trouvé' },
        { status: 404 }
      )
    }

    // Calculer les étudiants uniques à partir des stages
    const etudiantsMap = new Map<number, typeof tuteur.stages[0]['etudiant'] & { _count: { stages: number } }>()
    
    tuteur.stages.forEach(stage => {
      if (stage.etudiant && !etudiantsMap.has(stage.etudiant.id)) {
        etudiantsMap.set(stage.etudiant.id, stage.etudiant as typeof stage.etudiant & { _count: { stages: number } })
      }
    })

    const etudiants = Array.from(etudiantsMap.values()).sort((a, b) => {
      if (a.nom !== b.nom) return a.nom.localeCompare(b.nom)
      return a.prenom.localeCompare(b.prenom)
    })

    return NextResponse.json({
      ...tuteur,
      etudiants,
      _count: {
        ...tuteur._count,
        etudiants: etudiants.length
      }
    })
  } catch (error) {
    console.error('Error fetching tuteur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du tuteur' },
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
    const validatedData = tuteurSchema.parse(body)

    // Vérifier que le tuteur existe
    const existingTuteur = await prisma.tuteur.findUnique({
      where: { id }
    })

    if (!existingTuteur) {
      return NextResponse.json(
        { error: 'Tuteur non trouvé' },
        { status: 404 }
      )
    }

    // Gérer l'entreprise si nécessaire
    let entrepriseId = validatedData.id_entreprise || existingTuteur.idEntreprise

    if (validatedData.new_entreprise) {
      // Créer une nouvelle entreprise
      const newEntreprise = await prisma.entreprise.create({
        data: {
          nom: validatedData.new_entreprise.nom,
          adresse: validatedData.new_entreprise.adresse || null,
          secteur: validatedData.new_entreprise.secteur || null,
          telephone: validatedData.new_entreprise.telephone || null,
          email: validatedData.new_entreprise.email || null,
          departement: existingTuteur.departement
        }
      })
      entrepriseId = newEntreprise.id
    }

    // Mettre à jour le tuteur
    const updatedTuteur = await prisma.tuteur.update({
      where: { id },
      data: {
        nom: validatedData.nom,
        prenom: validatedData.prenom,
        telephone: validatedData.telephone || null,
        email: validatedData.email || null,
        idEntreprise: entrepriseId
      },
      include: {
        entreprise: true
      }
    })

    return NextResponse.json(updatedTuteur)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating tuteur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du tuteur' },
      { status: 500 }
    )
  }
}

