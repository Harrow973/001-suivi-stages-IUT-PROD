import { z } from 'zod'

export const stageSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  description: z.string().min(1, 'La description est obligatoire'),
  date_debut: z.string().refine((date) => {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }, {
    message: 'Date de début invalide'
  }),
  date_fin: z.string(),
  promotion: z.string().optional().nullable(),
  annee_universitaire: z.string().optional().nullable(),
  statut: z.enum(['ACTIF', 'TERMINE', 'ANNULE']).optional(),
  departement: z.enum(['INFO', 'GEA', 'HSE', 'MLT', 'TC']).optional(),
  id_entreprise: z.number().int().positive().optional().nullable(),
  id_etudiant: z.number().int().positive().optional().nullable(),
  id_tuteur: z.number().int().positive().optional().nullable(),
  // Pour les nouveaux éléments
  new_entreprise: z.object({
    nom: z.string().min(1),
    adresse: z.string().optional(),
    secteur: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
  new_etudiant: z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
  new_tuteur: z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
}).refine((data) => {
  if (data.date_debut && data.date_fin) {
    return new Date(data.date_fin) >= new Date(data.date_debut)
  }
  return true
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['date_fin']
})

export const entrepriseSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  adresse: z.string().optional(),
  secteur: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres').optional().or(z.literal('')),
  tailleEntreprise: z.enum(['TPE', 'PME', 'ETI', 'GE']).optional().nullable(),
  estActive: z.boolean().optional()
})

export const etudiantSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  email: z.string().email().optional().or(z.literal('')),
  promotion: z.string().optional().nullable(),
  annee_universitaire: z.string().optional().nullable()
})

export const tuteurSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  telephone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  id_entreprise: z.number().int().positive().optional().nullable(),
  new_entreprise: z.object({
    nom: z.string().min(1),
    adresse: z.string().optional(),
    secteur: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional()
})

