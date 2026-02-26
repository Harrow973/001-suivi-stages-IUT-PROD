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
  estActive: z.boolean().optional(),
  departement: z.enum(['INFO', 'GEA', 'HSE', 'MLT', 'TC']).optional(),
})

export const etudiantSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  email: z.string().email().optional().or(z.literal('')),
  promotion: z.union([z.string(), z.number()]).optional().nullable(),
  annee_universitaire: z.string().optional().nullable(),
  departement: z.enum(['INFO', 'GEA', 'HSE', 'MLT', 'TC']).optional(),
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

// Schéma pour le formulaire de suivi de stage (donneesFormulaire)
// Structure permissive (passthrough) pour compatibilité, mais validation des champs requis et limites de taille
const evaluationNiveauSchema = z.enum(['insuffisant', 'a_améliorer', 'satisfaisant', 'tres_satisfaisant'])
const stringMax5000 = z.string().max(5000).optional()
const stringMax2000 = z.string().max(2000).optional()
const stringMax500 = z.string().max(500).optional()
const stringMax200 = z.string().max(200).optional()
const stringMax100 = z.string().max(100).optional()

const autoEvaluationSchema = z.object({
  implication: evaluationNiveauSchema.optional(),
  autonomie: evaluationNiveauSchema.optional(),
  communication: evaluationNiveauSchema.optional(),
  gestionTemps: evaluationNiveauSchema.optional(),
  priseInitiative: evaluationNiveauSchema.optional(),
}).passthrough()

const suiviStagiaireSchema = z.object({
  objectifs: stringMax5000,
  activitesRealisees: stringMax5000,
  autoEvaluation: autoEvaluationSchema.optional().default({}),
  commentaires: stringMax2000,
  dateSaisie: z.string().optional(),
  signature: stringMax500,
}).passthrough()

const suiviTuteurEntrepriseSchema = z.object({
  comportementSavoirEtre: z.object({
    assiduite: evaluationNiveauSchema.optional(),
    respectConsignes: evaluationNiveauSchema.optional(),
    integrationEquipe: evaluationNiveauSchema.optional(),
    communication: evaluationNiveauSchema.optional(),
  }).passthrough().optional().default({}),
  competencesProfessionnelles: z.object({
    qualiteTravail: evaluationNiveauSchema.optional(),
    rigueurFiabilite: evaluationNiveauSchema.optional(),
    resolutionProblemes: evaluationNiveauSchema.optional(),
    autonomie: evaluationNiveauSchema.optional(),
    maitriseOutils: evaluationNiveauSchema.optional(),
  }).passthrough().optional().default({}),
  adequationStage: z.object({
    niveau: z.enum(['tres_adapte', 'adapte', 'peu_adapte', 'non_adapte']).optional(),
    commentaires: stringMax2000,
  }).passthrough().optional().default({}),
  appreciationGlobale: stringMax2000,
  accueilFutur: z.enum(['oui', 'non', 'a_discuter']).optional(),
  perspectives: stringMax2000,
  lieu: stringMax200,
  date: z.string().optional(),
  nomTuteur: stringMax100,
  signature: stringMax500,
}).passthrough()

const suiviTuteurPedagogiqueSchema = z.object({
  informationsVisite: z.object({
    typeEchange: z.enum(['visite_entreprise', 'visioconference', 'telephone', 'iut']).optional(),
    dateVisite: z.string().optional(),
    presents: z.object({
      stagiaire: z.boolean().optional(),
      tuteurEntreprise: z.boolean().optional(),
      autre: z.boolean().optional(),
    }).passthrough().optional().default({}),
  }).passthrough().optional().default({ presents: {} }),
  verificationCadrePedagogique: z.object({
    adequationMissions: z.boolean().optional(),
    chargeTravailAdaptee: z.boolean().optional(),
    encadrementSuffisant: z.boolean().optional(),
    conditionsMaterielles: z.boolean().optional(),
  }).passthrough().optional().default({}),
  appreciationSynthetique: stringMax2000,
  validationPeriode: z.object({
    statut: z.enum(['validee', 'validee_reserves', 'non_validee']).optional(),
    commentaires: stringMax2000,
  }).passthrough().optional().default({}),
  date: z.string().optional(),
  nomTuteur: stringMax100,
  signature: stringMax500,
}).passthrough()

export const formulaireSuiviStageSchema = z.object({
  idStage: z.number().int().positive(),
  suiviStagiaire: suiviStagiaireSchema,
  suiviTuteurEntreprise: suiviTuteurEntrepriseSchema,
  suiviTuteurPedagogique: suiviTuteurPedagogiqueSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

/** Taille max du JSON donneesFormulaire (50 Ko) */
export const FORMULAIRE_SUIVI_MAX_BYTES = 50 * 1024

