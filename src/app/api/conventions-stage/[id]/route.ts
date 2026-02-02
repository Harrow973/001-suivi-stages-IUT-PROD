import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { deleteFile, getConventionPath, extractFileName, isOldPath } from '@/lib/file-storage'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * GET /api/conventions-stage/[id]
 * Récupère une convention spécifique
 */
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

    const convention = await prisma.conventionStage.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            etudiant: true,
            entreprise: true,
            tuteur: true,
          },
        },
      },
    })

    if (!convention) {
      return NextResponse.json(
        { error: 'Convention non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(convention)
  } catch (error) {
    logger.error('Erreur lors de la récupération de la convention', error as Error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération de la convention',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/conventions-stage/[id]
 * Supprime une convention
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: number | undefined;
  try {
    const { id: idParam } = await params
    id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer la convention pour obtenir le chemin du fichier
    const convention = await prisma.conventionStage.findUnique({
      where: { id },
    })

    if (!convention) {
      return NextResponse.json(
        { error: 'Convention non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer le fichier physique
    try {
      if (isOldPath(convention.cheminFichier)) {
        // Ancien chemin (public/)
        const filePath = join(process.cwd(), 'public', convention.cheminFichier)
        if (existsSync(filePath)) {
          await deleteFile(filePath)
        }
      } else {
        // Nouveau chemin (storage/)
        const fileName = extractFileName(convention.cheminFichier)
        const filePath = getConventionPath(fileName)
        await deleteFile(filePath)
      }
    } catch (_fileError) {
      logger.warn('Erreur lors de la suppression du fichier', { 
        conventionId: id,
        cheminFichier: convention.cheminFichier 
      })
      // On continue même si la suppression du fichier échoue
    }

    // Supprimer l'enregistrement en base de données
    await prisma.conventionStage.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Convention supprimée avec succès',
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Erreur lors de la suppression de la convention', error as Error, { conventionId: id ?? 'unknown' })
    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression de la convention',
      },
      { status: 500 }
    )
  }
}

