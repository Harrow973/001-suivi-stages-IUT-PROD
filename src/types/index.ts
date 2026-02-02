import { Entreprise, Etudiant, Tuteur, Stage } from '@/generated/client'

export type StageWithRelations = Stage & {
  entreprise: Entreprise | null
  etudiant: Etudiant | null
  tuteur: Tuteur | null
}

export type TuteurWithRelations = Tuteur & {
  entreprise: Entreprise | null
  stages: (Stage & {
    etudiant: Etudiant | null
  })[]
  etudiantsActuels?: string
  etudiantsHistorique?: string
}

export type EtudiantWithRelations = Etudiant & {
  tuteur: Tuteur | null
}

export type EntrepriseType = Entreprise
export type EtudiantType = Etudiant
export type TuteurType = Tuteur
export type StageType = Stage

// Types pour le formulaire de suivi de stage
export type EvaluationNiveau = 'insuffisant' | 'a_améliorer' | 'satisfaisant' | 'tres_satisfaisant'

export type AdequationStage = 'tres_adapte' | 'adapte' | 'peu_adapte' | 'non_adapte'

export type TypeEchange = 'visite_entreprise' | 'visioconference' | 'telephone' | 'iut'

export type ValidationPeriode = 'validee' | 'validee_reserves' | 'non_validee'

export type AccueilFutur = 'oui' | 'non' | 'a_discuter'

export interface SuiviStagiaire {
  objectifs?: string
  activitesRealisees?: string
  autoEvaluation: {
    implication?: EvaluationNiveau
    autonomie?: EvaluationNiveau
    communication?: EvaluationNiveau
    gestionTemps?: EvaluationNiveau
    priseInitiative?: EvaluationNiveau
  }
  commentaires?: string
  dateSaisie?: string
  signature?: string
}

export interface SuiviTuteurEntreprise {
  comportementSavoirEtre: {
    assiduite?: EvaluationNiveau
    respectConsignes?: EvaluationNiveau
    integrationEquipe?: EvaluationNiveau
    communication?: EvaluationNiveau
  }
  competencesProfessionnelles: {
    qualiteTravail?: EvaluationNiveau
    rigueurFiabilite?: EvaluationNiveau
    resolutionProblemes?: EvaluationNiveau
    autonomie?: EvaluationNiveau
    maitriseOutils?: EvaluationNiveau
  }
  adequationStage: {
    niveau?: AdequationStage
    commentaires?: string
  }
  appreciationGlobale?: string
  accueilFutur?: AccueilFutur
  perspectives?: string
  lieu?: string
  date?: string
  nomTuteur?: string
  signature?: string
}

export interface SuiviTuteurPedagogique {
  informationsVisite: {
    typeEchange?: TypeEchange
    dateVisite?: string
    presents: {
      stagiaire?: boolean
      tuteurEntreprise?: boolean
      autre?: boolean
    }
  }
  verificationCadrePedagogique: {
    adequationMissions?: boolean
    chargeTravailAdaptee?: boolean
    encadrementSuffisant?: boolean
    conditionsMaterielles?: boolean
  }
  appreciationSynthetique?: string
  validationPeriode: {
    statut?: ValidationPeriode
    commentaires?: string
  }
  date?: string
  nomTuteur?: string
  signature?: string
}

export interface FormulaireSuiviStage {
  idStage: number
  suiviStagiaire: SuiviStagiaire
  suiviTuteurEntreprise: SuiviTuteurEntreprise
  suiviTuteurPedagogique: SuiviTuteurPedagogique
  createdAt?: string
  updatedAt?: string
}

