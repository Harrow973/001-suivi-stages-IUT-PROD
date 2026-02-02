import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour le formulaire
const formulaireStageSchema = z.object({
  // Étudiant
  new_etudiant: z.object({
    nom: z.string().min(1, 'Le nom est obligatoire'),
    prenom: z.string().min(1, 'Le prénom est obligatoire'),
    email: z.string().email().optional().or(z.literal('')),
  }),
  // Stage
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  description: z.string().min(1, 'La description est obligatoire'),
  date_debut: z.string().refine((date) => {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }, {
    message: 'Date de début invalide'
  }),
  date_fin: z.string().refine((date) => {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }, {
    message: 'Date de fin invalide'
  }),
  promotion: z.string().refine((val) => ['1', '2', '3'].includes(val), {
    message: 'La promotion doit être 1, 2 ou 3'
  }),
  annee_universitaire: z.string().min(1, 'L\'année universitaire est obligatoire'),
  departement: z.enum(['INFO', 'GEA', 'HSE', 'MLT', 'TC']),
  // Entreprise
  new_entreprise: z.object({
    nom: z.string().min(1, 'Le nom de l\'entreprise est obligatoire'),
    adresse: z.string().optional(),
    secteur: z.enum(['INFO', 'GEA', 'HSE', 'MLT', 'TC']),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
    tailleEntreprise: z.enum(['TPE', 'PME', 'ETI', 'GE']),
    estActive: z.boolean(),
    representantNom: z.string().optional(),
    representantQualite: z.string().optional(),
  }),
  // Tuteur
  new_tuteur: z.object({
    nom: z.string().min(1, 'Le nom du tuteur est obligatoire'),
    prenom: z.string().min(1, 'Le prénom du tuteur est obligatoire'),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
}).refine((data) => {
  if (data.date_debut && data.date_fin) {
    return new Date(data.date_fin) >= new Date(data.date_debut)
  }
  return true
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['date_fin']
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation avec Zod
    const validatedData = formulaireStageSchema.parse(body)
    
    const dateDebut = new Date(validatedData.date_debut)
    const dateFin = new Date(validatedData.date_fin)
    const promotion = parseInt(validatedData.promotion)
    
    // Vérifier s'il existe déjà un stage pour cet étudiant avec les mêmes dates/promotion/année
    // On va d'abord créer l'étudiant pour pouvoir vérifier
    // Mais on vérifie d'abord si l'étudiant existe déjà
    let etudiant = await prisma.etudiant.findFirst({
      where: {
        nom: { equals: validatedData.new_etudiant.nom, mode: 'insensitive' },
        prenom: { equals: validatedData.new_etudiant.prenom, mode: 'insensitive' },
        email: validatedData.new_etudiant.email || undefined,
        departement: validatedData.departement,
      },
    })

    // Si l'étudiant existe déjà, vérifier les conflits de stages
    if (etudiant) {
      const stagesExistants = await prisma.stage.findMany({
        where: {
          idEtudiant: etudiant.id,
          promotion: promotion,
          anneeUniversitaire: validatedData.annee_universitaire,
          OR: [
            // Stages qui se chevauchent
            {
              AND: [
                { dateDebut: { lte: dateFin } },
                { dateFin: { gte: dateDebut } },
              ],
            },
          ],
        },
      })

      if (stagesExistants.length > 0) {
        return NextResponse.json(
          {
            error: 'Un stage existe déjà pour cette période et cette promotion. Les stages ne peuvent pas se chevaucher pour la même année de BUT.',
            details: `Vous avez déjà un stage enregistré du ${new Date(stagesExistants[0].dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stagesExistants[0].dateFin).toLocaleDateString('fr-FR')} pour la promotion ${promotion} en ${validatedData.annee_universitaire}.`
          },
          { status: 409 }
        )
      }
    }

    // Créer l'entreprise
    let entreprise = await prisma.entreprise.findFirst({
      where: {
        nom: { equals: validatedData.new_entreprise.nom, mode: 'insensitive' },
        departement: validatedData.departement,
      },
    })

    if (!entreprise) {
      entreprise = await prisma.entreprise.create({
        data: {
          nom: validatedData.new_entreprise.nom,
          adresse: validatedData.new_entreprise.adresse || null,
          secteur: validatedData.new_entreprise.secteur || null,
          telephone: validatedData.new_entreprise.telephone || null,
          email: validatedData.new_entreprise.email || null,
          siret: validatedData.new_entreprise.siret || null,
          tailleEntreprise: validatedData.new_entreprise.tailleEntreprise || null,
          estActive: validatedData.new_entreprise.estActive,
          representantNom: validatedData.new_entreprise.representantNom || null,
          representantQualite: validatedData.new_entreprise.representantQualite || null,
          departement: validatedData.departement,
        },
      })
    } else {
      // Mettre à jour l'entreprise si les champs sont fournis
      entreprise = await prisma.entreprise.update({
        where: { id: entreprise.id },
        data: {
          siret: validatedData.new_entreprise.siret || entreprise.siret,
          tailleEntreprise: validatedData.new_entreprise.tailleEntreprise || entreprise.tailleEntreprise,
          estActive: validatedData.new_entreprise.estActive !== undefined ? validatedData.new_entreprise.estActive : entreprise.estActive,
          representantNom: validatedData.new_entreprise.representantNom || entreprise.representantNom,
          representantQualite: validatedData.new_entreprise.representantQualite || entreprise.representantQualite,
        },
      })
    }

    // Créer ou mettre à jour l'étudiant
    if (!etudiant) {
      etudiant = await prisma.etudiant.create({
        data: {
          nom: validatedData.new_etudiant.nom,
          prenom: validatedData.new_etudiant.prenom,
          email: validatedData.new_etudiant.email || null,
          departement: validatedData.departement,
          promotion: promotion,
          anneeUniversitaire: validatedData.annee_universitaire,
        },
      })
    } else {
      // Mettre à jour l'étudiant si nécessaire
      etudiant = await prisma.etudiant.update({
        where: { id: etudiant.id },
        data: {
          email: validatedData.new_etudiant.email || etudiant.email,
          promotion: promotion,
          anneeUniversitaire: validatedData.annee_universitaire,
        },
      })
    }

    // Créer le tuteur
    let tuteur = await prisma.tuteur.findFirst({
      where: {
        nom: { equals: validatedData.new_tuteur.nom, mode: 'insensitive' },
        prenom: { equals: validatedData.new_tuteur.prenom, mode: 'insensitive' },
        idEntreprise: entreprise.id,
      },
    })

    if (!tuteur) {
      tuteur = await prisma.tuteur.create({
        data: {
          nom: validatedData.new_tuteur.nom,
          prenom: validatedData.new_tuteur.prenom,
          telephone: validatedData.new_tuteur.telephone || null,
          email: validatedData.new_tuteur.email || null,
          departement: validatedData.departement,
          idEntreprise: entreprise.id,
        },
      })
    }

    // Créer le stage
    // Tronquer le sujet à 100 caractères (limite de la base de données)
    const sujetTronque = validatedData.sujet.length > 100 
      ? validatedData.sujet.substring(0, 97) + '...' 
      : validatedData.sujet
    
    const stage = await prisma.stage.create({
      data: {
        sujet: sujetTronque,
        description: validatedData.description,
        dateDebut: dateDebut,
        dateFin: dateFin,
        departement: validatedData.departement,
        promotion: promotion,
        anneeUniversitaire: validatedData.annee_universitaire,
        idEntreprise: entreprise.id,
        idEtudiant: etudiant.id,
        idTuteur: tuteur.id,
        statut: 'ACTIF',
      },
      include: {
        entreprise: true,
        etudiant: true,
        tuteur: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Stage créé avec succès',
        stage,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: error.issues,
        },
        { status: 400 }
      )
    }
    console.error('Error creating stage from formulaire:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du stage',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}

