import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { Departement } from '@/generated/enums'
import { logger } from '@/lib/logger'
import { checkRateLimit, uploadRateLimiter } from '@/lib/rate-limit'
import { 
  ensureStorageDirs, 
  getConventionPath, 
  generateSafeFileName, 
  getStorageRelativePath 
} from '@/lib/file-storage'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/conventions-stage
 * Récupère la liste des conventions de stage
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departement = (searchParams.get('departement') || 'INFO') as Departement
    const search = searchParams.get('q') || ''
    const promotion = searchParams.get('promotion')
    const anneeUniversitaire = searchParams.get('anneeUniversitaire')

    const where: any = {
      departement,
    }

    if (search) {
      where.OR = [
        { nomEtudiant: { contains: search, mode: 'insensitive' } },
        { prenomEtudiant: { contains: search, mode: 'insensitive' } },
        { nomEntreprise: { contains: search, mode: 'insensitive' } },
        { nomFichier: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (promotion) {
      where.promotion = parseInt(promotion)
    }

    if (anneeUniversitaire) {
      where.anneeUniversitaire = anneeUniversitaire
    }

    const conventions = await prisma.conventionStage.findMany({
      where,
      include: {
        stage: {
          include: {
            etudiant: true,
            entreprise: true,
            tuteur: true,
          },
        },
      },
      orderBy: {
        dateUpload: 'desc',
      },
    })

    return NextResponse.json(conventions)
  } catch (error) {
    logger.error('Erreur lors de la récupération des conventions', error as Error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des conventions',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/conventions-stage
 * Crée une nouvelle convention de stage
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, uploadRateLimiter)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const idStage = formData.get('idStage') ? parseInt(formData.get('idStage') as string) : null
    const nomEtudiant = formData.get('nomEtudiant') as string | null
    const prenomEtudiant = formData.get('prenomEtudiant') as string | null
    const nomEntreprise = formData.get('nomEntreprise') as string | null
    const departement = ((formData.get('departement') as string) || 'INFO') as Departement
    const promotion = formData.get('promotion') ? parseInt(formData.get('promotion') as string) : null
    const anneeUniversitaire = formData.get('anneeUniversitaire') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    // S'assurer que les dossiers de stockage existent
    await ensureStorageDirs()

    // Générer un nom de fichier unique et sécurisé
    const fileName = generateSafeFileName(file.name)
    const filePath = getConventionPath(fileName)
    const relativePath = getStorageRelativePath(fileName, 'convention')

    // Sauvegarder le fichier
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    // Créer l'enregistrement en base de données
    const convention = await prisma.conventionStage.create({
      data: {
        idStage: idStage,
        nomFichier: file.name,
        cheminFichier: relativePath,
        tailleFichier: file.size,
        nomEtudiant: nomEtudiant,
        prenomEtudiant: prenomEtudiant,
        nomEntreprise: nomEntreprise,
        departement: departement as any,
        promotion: promotion,
        anneeUniversitaire: anneeUniversitaire,
      },
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

    return NextResponse.json(
      {
        success: true,
        message: 'Convention enregistrée avec succès',
        convention,
      },
      { status: 201 }
    )
  } catch (error) {
    let fileName = 'unknown';
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file instanceof File) {
        fileName = file.name;
      }
    } catch {
      // Ignorer si on ne peut pas lire le formData
    }
    logger.error('Erreur lors de l\'enregistrement de la convention', error as Error, {
      fileName,
    })
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'enregistrement de la convention',
      },
      { status: 500 }
    )
  }
}

