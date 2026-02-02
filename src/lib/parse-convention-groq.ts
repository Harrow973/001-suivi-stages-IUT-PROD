import pdfParse from 'pdf-parse'
import { validateConventionDocument } from './parse-convention'

/**
 * Interface pour les données de convention parsées
 */
export interface ConventionData {
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

// Regex précompilées pour améliorer les performances
const REGEX_JSON_MATCH = /\{[\s\S]*\}/
const REGEX_NOM_JSON = /"nom"\s*:\s*"([^"]+)"/i
const REGEX_NOM_TEXT = /nom[:\s]+([A-Z\s\-]+)/i
const REGEX_PRENOM_JSON = /"prenom"\s*:\s*"([^"]+)"/i
const REGEX_PRENOM_TEXT = /prenom[:\s]+([A-Za-z\s\-]+)/i
const REGEX_EMAIL_JSON = /"email"\s*:\s*"([^"]+)"/i
const REGEX_EMAIL_TEXT = /email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
const REGEX_NUMERO_JSON = /"numeroEtudiant"\s*:\s*"([^"]+)"/i
const REGEX_NUMERO_TEXT = /numéro[:\s]+(\d+)/i
const REGEX_ANNEE_JSON = /"anneeUniversitaire"\s*:\s*"([^"]+)"/i
const REGEX_ANNEE_TEXT = /année[:\s]+(\d{4}\/\d{4})/i
const REGEX_DEPARTEMENT_JSON = /"departement"\s*:\s*"([^"]+)"/i
const REGEX_DEPARTEMENT_TEXT = /département[:\s]+(INFO|GLT|GEA|TC|MMI)/i
const REGEX_PROMOTION_JSON = /"promotion"\s*:\s*"([^"]+)"/i
const REGEX_PROMOTION_TEXT = /promotion[:\s]+(B[1-3]|M[1-2])/i
const REGEX_SUJET_JSON = /"sujet"\s*:\s*"([^"]+)"/i
const REGEX_DESCRIPTION_JSON = /"description"\s*:\s*"([^"]+)"/i
const REGEX_DATE_DEBUT_JSON = /"dateDebut"\s*:\s*"([^"]+)"/i
const REGEX_DATE_DEBUT_TEXT = /dateDébut[:\s]+(\d{4}-\d{2}-\d{2})/i
const REGEX_DATE_FIN_JSON = /"dateFin"\s*:\s*"([^"]+)"/i
const REGEX_DATE_FIN_TEXT = /dateFin[:\s]+(\d{4}-\d{2}-\d{2})/i
const REGEX_ENTREPRISE_NOM_JSON = /"entrepriseNom"\s*:\s*"([^"]+)"/i
const REGEX_ENTREPRISE_ADRESSE_JSON = /"entrepriseAdresse"\s*:\s*"([^"]+)"/i
const REGEX_ENTREPRISE_TEL_JSON = /"entrepriseTelephone"\s*:\s*"([^"]+)"/i
const REGEX_ENTREPRISE_EMAIL_JSON = /"entrepriseEmail"\s*:\s*"([^"]+)"/i
const REGEX_ENTREPRISE_REPRESENTANT_NOM_JSON = /"entrepriseRepresentantNom"\s*:\s*"([^"]+)"/i
const REGEX_ENTREPRISE_REPRESENTANT_QUALITE_JSON = /"entrepriseRepresentantQualite"\s*:\s*"([^"]+)"/i
const REGEX_TUTEUR_NOM_JSON = /"tuteurNom"\s*:\s*"([^"]+)"/i
const REGEX_TUTEUR_PRENOM_JSON = /"tuteurPrenom"\s*:\s*"([^"]+)"/i
const REGEX_TUTEUR_TEL_JSON = /"tuteurTelephone"\s*:\s*"([^"]+)"/i
const REGEX_TUTEUR_EMAIL_JSON = /"tuteurEmail"\s*:\s*"([^"]+)"/i
const REGEX_TUTEUR_FONCTION_JSON = /"tuteurFonction"\s*:\s*"([^"]+)"/i

// Regex précompilées pour la séparation nom/prénom
const REGEX_NOM_PRENOM_FORMAT1 = /^([A-Z\s\-]+?)\s+([A-Za-z\s\-]+)$/
const REGEX_NOM_PRENOM_FORMAT2 = /^([A-Za-z\s\-]+?)\s+([A-Z\s\-]+)$/
const REGEX_NOM_PRENOM_FORMAT3 = /^(?:M\.|Mme|Mr|Monsieur|Madame)\s+([A-Z\s\-]+?)\s+([A-Za-z\s\-]+)$/i
const REGEX_HAS_LOWERCASE = /[a-z]/
const REGEX_HAS_UPPERCASE = /[A-Z]{2,}/

// Template du prompt (partie statique)
const PROMPT_TEMPLATE = `Tu es un assistant expert en extraction de données. Extrais les informations suivantes d'une convention de stage et retourne-les en JSON valide.

Texte de la convention:
{text}

Extrais et retourne UNIQUEMENT un JSON valide avec cette structure exacte (utilise null pour les champs non trouvés):
{
  "nom": "string ou null",
  "prenom": "string ou null",
  "email": "string ou null",
  "numeroEtudiant": "string ou null",
  "anneeUniversitaire": "string au format YYYY/YYYY ou null",
  "departement": "INFO, GLT, GEA, TC, MMI ou null",
  "promotion": "B1, B2, B3, M1, M2 ou null",
  "sujet": "string (max 100 caractères) ou null",
  "description": "string ou null",
  "dateDebut": "string au format YYYY-MM-DD ou null",
  "dateFin": "string au format YYYY-MM-DD ou null",
  "entrepriseNom": "string ou null",
  "entrepriseAdresse": "string ou null",
  "entrepriseTelephone": "string ou null",
  "entrepriseEmail": "string ou null",
  "entrepriseRepresentantNom": "string ou null",
  "entrepriseRepresentantQualite": "string ou null",
  "tuteurNom": "string ou null",
  "tuteurPrenom": "string ou null",
  "tuteurTelephone": "string ou null",
  "tuteurEmail": "string ou null",
  "tuteurFonction": "string ou null",
  "referentNom": "string ou null",
  "referentPrenom": "string ou null",
  "referentEmail": "string ou null"
}

Instructions:
- Pour les dates, convertis le format DD/MM/YYYY en YYYY-MM-DD
- Pour l'année universitaire, utilise le format YYYY/YYYY
- Pour le sujet, limite à 100 caractères maximum (tronque si nécessaire)
- Pour la description, extrais le contenu de la section "ACTIVITÉS CONFIÉES" ou "DESCRIPTION DU STAGE" ou toute section décrivant les missions/tâches du stagiaire
- La description doit contenir les activités, missions ou tâches confiées au stagiaire (peut être plus longue que le sujet)
- Pour entrepriseRepresentantNom, cherche le champ "Représenté par (nom du signataire de la convention)" ou "Représenté par" dans la section "L'ORGANISME D'ACCUEIL"
- Pour entrepriseRepresentantQualite, cherche le champ "Qualité du représentant" dans la section "L'ORGANISME D'ACCUEIL"
- IMPORTANT pour le tuteur: tuteurNom et tuteurPrenom doivent être SÉPARÉS. 
  - Cherche la section "LE TUTEUR DE STAGE" ou "TUTEUR DE STAGE" ou "Nom et prénom du tuteur"
  - Le nom du tuteur est généralement en MAJUSCULES (ex: "MARTIN")
  - Le prénom du tuteur est généralement en minuscules ou mixte (ex: "Pierre" ou "Jean-Michel")
  - Format typique: "Nom et prénom du tuteur de stage : MARTIN Pierre" → tuteurNom: "MARTIN", tuteurPrenom: "Pierre"
  - Si le format est "M. MARTIN Pierre" ou "Mme DUPONT Marie", extrais "MARTIN" comme nom et "Pierre" comme prénom (ignore le titre)
  - Si tu trouves "MARTIN Pierre" dans un seul champ, sépare-le: nom="MARTIN", prénom="Pierre"
  - Si tu trouves "Pierre MARTIN", sépare-le aussi: nom="MARTIN", prénom="Pierre"
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Si un champ n'est pas trouvé, utilise null`

/**
 * Convertit une date DD/MM/YYYY en format ISO YYYY-MM-DD
 */
function formatDateToISO(dateStr: string): string | null {
  if (!dateStr || !dateStr.includes('/')) {
    return null
  }
  
  const trimmed = dateStr.trim()
  const parts = trimmed.split('/')
  
  if (parts.length !== 3) {
    return null
  }
  
  const [day, month, year] = parts
  if (day && month && year) {
    const monthPadded = month.length === 1 ? `0${month}` : month
    const dayPadded = day.length === 1 ? `0${day}` : day
    return `${year}-${monthPadded}-${dayPadded}`
  }
  
  return null
}

/**
 * Sépare le nom et prénom du tuteur si ils sont dans un seul champ
 */
function separateTuteurName(nom?: string, prenom?: string): { nom: string | undefined, prenom: string | undefined } {
  if (nom && prenom) {
    const nomTrimmed = nom.trim()
    const prenomTrimmed = prenom.trim()
    
    if (nomTrimmed.includes(' ') && REGEX_HAS_LOWERCASE.test(nomTrimmed)) {
      const match = REGEX_NOM_PRENOM_FORMAT1.exec(nomTrimmed)
      if (match) {
        return { nom: match[1].trim(), prenom: match[2].trim() }
      }
    }
    
    if (prenomTrimmed.includes(' ') && REGEX_HAS_UPPERCASE.test(prenomTrimmed)) {
      const match = REGEX_NOM_PRENOM_FORMAT2.exec(prenomTrimmed)
      if (match) {
        return { nom: match[2].trim(), prenom: match[1].trim() }
      }
    }
    
    return { nom: nomTrimmed, prenom: prenomTrimmed }
  }
  
  if (nom && !prenom) {
    const fullName = nom.trim()
    let match = REGEX_NOM_PRENOM_FORMAT1.exec(fullName)
    if (match) {
      return { nom: match[1].trim(), prenom: match[2].trim() }
    }
    match = REGEX_NOM_PRENOM_FORMAT2.exec(fullName)
    if (match) {
      return { nom: match[2].trim(), prenom: match[1].trim() }
    }
    match = REGEX_NOM_PRENOM_FORMAT3.exec(fullName)
    if (match) {
      return { nom: match[1].trim(), prenom: match[2].trim() }
    }
  }
  
  if (prenom && !nom) {
    const fullName = prenom.trim()
    let match = REGEX_NOM_PRENOM_FORMAT1.exec(fullName)
    if (match) {
      return { nom: match[1].trim(), prenom: match[2].trim() }
    }
    match = REGEX_NOM_PRENOM_FORMAT2.exec(fullName)
    if (match) {
      return { nom: match[2].trim(), prenom: match[1].trim() }
    }
  }
  
  return { nom, prenom }
}

/**
 * Parse la réponse JSON de Groq
 */
function parseGroqResponse(response: string): ConventionData {
  const data: ConventionData = {}
  
  // Essayer de parser directement le JSON
  const jsonMatch = REGEX_JSON_MATCH.exec(response)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed as ConventionData
    } catch {
      // Si le parsing JSON échoue, continuer avec l'extraction manuelle
    }
  }
  
  // Extraction manuelle depuis le texte si le JSON n'est pas valide
  let match = REGEX_NOM_JSON.exec(response) || REGEX_NOM_TEXT.exec(response)
  if (match) data.nom = match[1].trim()
  
  match = REGEX_PRENOM_JSON.exec(response) || REGEX_PRENOM_TEXT.exec(response)
  if (match) data.prenom = match[1].trim()
  
  match = REGEX_EMAIL_JSON.exec(response) || REGEX_EMAIL_TEXT.exec(response)
  if (match) data.email = match[1].trim()
  
  match = REGEX_NUMERO_JSON.exec(response) || REGEX_NUMERO_TEXT.exec(response)
  if (match) data.numeroEtudiant = match[1].trim()
  
  match = REGEX_ANNEE_JSON.exec(response) || REGEX_ANNEE_TEXT.exec(response)
  if (match) data.anneeUniversitaire = match[1].trim()
  
  match = REGEX_DEPARTEMENT_JSON.exec(response) || REGEX_DEPARTEMENT_TEXT.exec(response)
  if (match) data.departement = match[1].trim()
  
  match = REGEX_PROMOTION_JSON.exec(response) || REGEX_PROMOTION_TEXT.exec(response)
  if (match) data.promotion = match[1].trim().toUpperCase()
  
  match = REGEX_SUJET_JSON.exec(response)
  if (match) data.sujet = match[1].trim()
  
  match = REGEX_DESCRIPTION_JSON.exec(response)
  if (match) data.description = match[1].trim()
  
  match = REGEX_DATE_DEBUT_JSON.exec(response) || REGEX_DATE_DEBUT_TEXT.exec(response)
  if (match) data.dateDebut = match[1].trim()
  
  match = REGEX_DATE_FIN_JSON.exec(response) || REGEX_DATE_FIN_TEXT.exec(response)
  if (match) data.dateFin = match[1].trim()
  
  match = REGEX_ENTREPRISE_NOM_JSON.exec(response)
  if (match) data.entrepriseNom = match[1].trim()
  
  match = REGEX_ENTREPRISE_ADRESSE_JSON.exec(response)
  if (match) data.entrepriseAdresse = match[1].trim()
  
  match = REGEX_ENTREPRISE_TEL_JSON.exec(response)
  if (match) data.entrepriseTelephone = match[1].trim()
  
  match = REGEX_ENTREPRISE_EMAIL_JSON.exec(response)
  if (match) data.entrepriseEmail = match[1].trim()
  
  match = REGEX_ENTREPRISE_REPRESENTANT_NOM_JSON.exec(response)
  if (match) data.entrepriseRepresentantNom = match[1].trim()
  
  match = REGEX_ENTREPRISE_REPRESENTANT_QUALITE_JSON.exec(response)
  if (match) data.entrepriseRepresentantQualite = match[1].trim()
  
  // Extraction du tuteur
  match = REGEX_TUTEUR_NOM_JSON.exec(response)
  if (match) data.tuteurNom = match[1].trim()
  
  match = REGEX_TUTEUR_PRENOM_JSON.exec(response)
  if (match) data.tuteurPrenom = match[1].trim()
  
  if ((data.tuteurNom && !data.tuteurPrenom) || (!data.tuteurNom && data.tuteurPrenom)) {
    const fullName = (data.tuteurNom || data.tuteurPrenom)?.trim() || ''
    let nameMatch = REGEX_NOM_PRENOM_FORMAT1.exec(fullName)
    if (nameMatch) {
      data.tuteurNom = nameMatch[1].trim()
      data.tuteurPrenom = nameMatch[2].trim()
    } else {
      nameMatch = REGEX_NOM_PRENOM_FORMAT2.exec(fullName)
      if (nameMatch) {
        data.tuteurNom = nameMatch[2].trim()
        data.tuteurPrenom = nameMatch[1].trim()
      } else {
        nameMatch = REGEX_NOM_PRENOM_FORMAT3.exec(fullName)
        if (nameMatch) {
          data.tuteurNom = nameMatch[1].trim()
          data.tuteurPrenom = nameMatch[2].trim()
        }
      }
    }
  }
  
  match = REGEX_TUTEUR_TEL_JSON.exec(response)
  if (match) data.tuteurTelephone = match[1].trim()
  
  match = REGEX_TUTEUR_EMAIL_JSON.exec(response)
  if (match) data.tuteurEmail = match[1].trim()
  
  match = REGEX_TUTEUR_FONCTION_JSON.exec(response)
  if (match) data.tuteurFonction = match[1].trim()
  
  return data
}

/**
 * Extrait le texte d'un PDF et utilise Groq Cloud pour parser les données
 */
export async function parseConventionPDFWithGroq(
  pdfBuffer: Buffer,
  apiKey: string,
  model: string = 'llama-3.1-8b-instant'
): Promise<ConventionData> {
  try {
    // Extraire le texte du PDF
    const pdfData = await pdfParse(pdfBuffer)
    const text = pdfData.text
    
    if (!text || text.trim().length === 0) {
      throw new Error('Le PDF ne contient pas de texte extractible. Il s\'agit peut-être d\'un PDF scanné (image).')
    }
    
    // Valider que c'est bien une convention de stage
    const validation = validateConventionDocument(text)
    if (!validation.isValid) {
      throw new Error(validation.reason || 'Impossible d\'extraire les données du PDF. Le document ne semble pas être une convention de stage.\nVérifie que le fichier uploadé est bien une convention de stage IUT contenant les mentions de l\'étudiant, de l\'entreprise et du tuteur.')
    }
    
    // Limiter le texte à 6000 caractères
    const limitedText = text.length > 6000 ? text.slice(0, 6000) + '...' : text
    
    // Créer le prompt
    const prompt = PROMPT_TEMPLATE.replace('{text}', limitedText)

    // Appeler Groq API avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Timeout de 60 secondes
    
    let response: Response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Timeout lors de la connexion à Groq. Le service peut être surchargé.');
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Groq: ${response.statusText}. ${errorText}`)
    }

    const result = await response.json()
    const generatedText = result.choices?.[0]?.message?.content || ''
    
    if (!generatedText) {
      throw new Error('Aucune réponse générée par Groq')
    }
    
    // Parser la réponse
    const parsedData = parseGroqResponse(generatedText)
    
    // Convertir les dates si elles sont au format DD/MM/YYYY
    if (parsedData.dateDebut && parsedData.dateDebut.includes('/') && !parsedData.dateDebut.includes('-')) {
      const convertedDate = formatDateToISO(parsedData.dateDebut)
      if (convertedDate) {
        parsedData.dateDebut = convertedDate
      }
    }
    if (parsedData.dateFin && parsedData.dateFin.includes('/') && !parsedData.dateFin.includes('-')) {
      const convertedDate = formatDateToISO(parsedData.dateFin)
      if (convertedDate) {
        parsedData.dateFin = convertedDate
      }
    }
    
    // Tronquer le sujet à 100 caractères
    if (parsedData.sujet && parsedData.sujet.length > 100) {
      parsedData.sujet = parsedData.sujet.slice(0, 97) + '...'
    }
    
    // Séparer le nom et prénom du tuteur si nécessaire
    const tuteurNames = separateTuteurName(parsedData.tuteurNom, parsedData.tuteurPrenom)
    parsedData.tuteurNom = tuteurNames.nom
    parsedData.tuteurPrenom = tuteurNames.prenom
    
    return parsedData
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de l'extraction avec Groq: ${error.message}`)
    }
    throw new Error('Erreur inconnue lors de l\'extraction avec Groq')
  }
}

