import { NextRequest, NextResponse } from 'next/server'
import { parseConventionPDF } from '@/lib/parse-convention'
import { parseConventionPDFWithGroq } from '@/lib/parse-convention-groq'
import { logger } from '@/lib/logger'
import { checkRateLimit, uploadRateLimiter } from '@/lib/rate-limit'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Interface pour les données de convention parsées
 */
interface ConventionData {
  // Informations étudiant
  nom?: string
  prenom?: string
  email?: string
  numeroEtudiant?: string
  
  // Informations stage
  anneeUniversitaire?: string
  departement?: string
  promotion?: string
  sujet?: string
  description?: string
  dateDebut?: string
  dateFin?: string
  
  // Informations entreprise
  entrepriseNom?: string
  entrepriseAdresse?: string
  entrepriseSecteur?: string
  entrepriseTelephone?: string
  entrepriseEmail?: string
  entrepriseRepresentantNom?: string
  entrepriseRepresentantQualite?: string
  
  // Informations tuteur
  tuteurNom?: string
  tuteurPrenom?: string
  tuteurTelephone?: string
  tuteurEmail?: string
  tuteurFonction?: string
  
  // Informations référent (optionnel)
  referentNom?: string
  referentPrenom?: string
  referentEmail?: string
}

/**
 * API Route pour parser une convention de stage depuis un PDF
 * 
 * POST /api/parse-convention
 * Body: FormData avec un champ 'file' contenant le PDF
 * Query params: ?method=regex (pour utiliser regex uniquement)
 * Par défaut: utilise Groq Cloud. Si Groq n'est pas disponible, retourne une erreur indiquant que le préremplissage n'est pas disponible
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitCheck = checkRateLimit(request, uploadRateLimiter)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const contentType = request.headers.get('content-type') || ''
    const { searchParams } = new URL(request.url)
    const method = searchParams.get('method') || 'groq' // 'groq' (par défaut) ou 'regex'

    // Mode 1: Fichier PDF (FormData)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

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

      // Convertir le File en Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Parser le PDF selon la méthode choisie
      let conventionData: ConventionData
      try {
        if (method === 'regex') {
          // Utiliser les regex (si explicitement demandé)
          conventionData = await parseConventionPDF(buffer)
        } else {
          // Utiliser Groq Cloud (par défaut)
          const groqApiKey = process.env.GROQ_API_KEY
          if (!groqApiKey) {
            throw new Error('GROQ_API_KEY n\'est pas configurée. Le préremplissage automatique n\'est pas disponible.')
          }
          const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
          conventionData = await parseConventionPDFWithGroq(buffer, groqApiKey, groqModel)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        
        // Vérifier si c'est une erreur de validation (document non conforme)
        const isValidationErrorDetected = errorMessage.includes('ne semble pas être une convention de stage') || 
                                         errorMessage.includes('convention de stage IUT')
        
        // Si c'est une erreur de validation, retourner un message clair
        if (isValidationErrorDetected) {
          return NextResponse.json(
            { 
              error: 'Impossible d\'extraire les données du PDF. Le document ne semble pas être une convention de stage.\nVérifie que le fichier uploadé est bien une convention de stage IUT contenant les mentions de l\'étudiant, de l\'entreprise et du tuteur.',
              isValidationError: true
            },
            { status: 400 }
          )
        }
        
        // Si Groq n'est pas disponible (erreur de connexion, clé API invalide, etc.)
        // Retourner un message indiquant que le préremplissage n'est pas disponible
        if (method !== 'regex') {
          const isGroqUnavailable = errorMessage.includes('Groq') || 
                                    errorMessage.includes('GROQ_API_KEY') ||
                                    errorMessage.includes('fetch failed') ||
                                    errorMessage.includes('ECONNREFUSED') ||
                                    errorMessage.includes('network') ||
                                    errorMessage.includes('timeout') ||
                                    errorMessage.includes('API key')
          
          if (isGroqUnavailable) {
            return NextResponse.json(
              { 
                error: 'Le préremplissage automatique n\'est pas disponible actuellement. Veuillez remplir le formulaire manuellement.',
                isPreFillUnavailable: true,
                hint: 'Pour activer le préremplissage, assurez-vous que GROQ_API_KEY est correctement configurée dans vos variables d\'environnement'
              },
              { status: 503 } // Service Unavailable
            )
          }
        }
        
        // Autre erreur technique
        return NextResponse.json(
          { 
            error: `Impossible d'extraire les données du PDF: ${errorMessage}`,
            isValidationError: false
          },
          { status: 400 }
        )
      }

      // Vérifier qu'on a au moins quelques informations essentielles
      const hasEssentialData = 
        conventionData.nom || 
        conventionData.prenom || 
        conventionData.entrepriseNom ||
        conventionData.sujet

      if (!hasEssentialData) {
        return NextResponse.json(
          { 
            error: 'Impossible d\'extraire les données du PDF. Le document ne semble pas être une convention de stage.\nVérifie que le fichier uploadé est bien une convention de stage IUT contenant les mentions de l\'étudiant, de l\'entreprise et du tuteur.',
            data: conventionData,
            isValidationError: true
          },
          { status: 400 }
        )
      }

      // Retourner les données avec des avertissements pour les champs manquants
      return NextResponse.json({
        success: true,
        data: conventionData,
        warnings: getWarnings(conventionData),
        method: method
      })
    }

    // Mode 2: Données JSON déjà parsées
    const conventionData: ConventionData = await request.json()

    if (!conventionData) {
      return NextResponse.json(
        { error: 'Aucune donnée fournie' },
        { status: 400 }
      )
    }

    // Vérifier qu'on a au moins quelques informations essentielles
    const hasEssentialData = 
      conventionData.nom || 
      conventionData.prenom || 
      conventionData.entrepriseNom ||
      conventionData.sujet

    if (!hasEssentialData) {
      return NextResponse.json(
        { 
          error: 'Données insuffisantes.',
          data: conventionData
        },
        { status: 400 }
      )
    }

    // Retourner les données avec des avertissements pour les champs manquants
    return NextResponse.json({
      success: true,
      data: conventionData,
      warnings: getWarnings(conventionData)
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors du traitement des données'
    logger.error('Erreur lors de la réception des données de convention', error instanceof Error ? error : new Error(errorMessage))
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Génère une liste d'avertissements pour les champs manquants
 */
function getWarnings(data: ConventionData): string[] {
  const warnings: string[] = []

  if (!data.nom || !data.prenom) {
    warnings.push('Informations étudiant incomplètes')
  }
  if (!data.entrepriseNom) {
    warnings.push('Nom de l\'entreprise non trouvé')
  }
  if (!data.sujet) {
    warnings.push('Sujet du stage non trouvé')
  }
  if (!data.dateDebut || !data.dateFin) {
    warnings.push('Dates du stage non trouvées')
  }
  if (!data.tuteurNom || !data.tuteurPrenom) {
    warnings.push('Informations tuteur incomplètes')
  }

  return warnings
}
