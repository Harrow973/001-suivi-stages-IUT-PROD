import pdfParse from 'pdf-parse'

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

/**
 * Convertit une date DD/MM/YYYY en format ISO YYYY-MM-DD
 */
function formatDateToISO(dateStr: string): string | null {
  try {
    const [day, month, year] = dateStr.trim().split('/')
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  } catch {
    // Ignore
  }
  return null
}

/**
 * Extrait et formate l'année universitaire (ex: 2025/2026)
 */
function formatAnneeUniversitaire(text: string): string | null {
  const match = text.match(/(\d{4})\s*\/\s*(\d{4})/)
  if (match) {
    return `${match[1]}/${match[2]}`
  }
  return null
}

/**
 * Extrait le département depuis le texte
 */
function extractDepartement(text: string): string | null {
  // Chercher des patterns comme "B3 Informatique", "INFO", etc.
  const match = text.match(/B\d+\s+(?:Informatique|INFO|GLT|GEA|TC|MMI)/i)
  if (match) {
    const matchText = match[0].toUpperCase()
    if (matchText.includes('INFO') || matchText.includes('INFORMATIQUE')) {
      return 'INFO'
    } else if (matchText.includes('GLT') || matchText.includes('GESTION LOGISTIQUE')) {
      return 'GLT'
    } else if (matchText.includes('GEA')) {
      return 'GEA'
    } else if (matchText.includes('TC')) {
      return 'TC'
    } else if (matchText.includes('MMI')) {
      return 'MMI'
    }
  }
  
  // Chercher directement "INFO", "GLT", etc.
  for (const dept of ['INFO', 'GLT', 'GEA', 'TC', 'MMI']) {
    if (text.toUpperCase().includes(dept)) {
      return dept
    }
  }
  
  return null
}

/**
 * Extrait la promotion (ex: B3, B2, etc.)
 */
function extractPromotion(text: string): string | null {
  // Chercher "B3 Informatique" ou similaire
  let match = text.match(/(B[1-3]|M[1-2])\s+(?:Informatique|INFO|GLT|GEA|TC|MMI)/i)
  if (match) {
    return match[1].toUpperCase()
  }
  
  // Chercher simplement "B3", "B2", etc.
  match = text.match(/\b(B[1-3]|M[1-2])\b/i)
  if (match) {
    return match[1].toUpperCase()
  }
  
  return null
}

/**
 * Nettoie un numéro de téléphone
 */
function cleanTelephone(tel: string): string {
  if (!tel) return ""
  // Garder seulement les chiffres, espaces, + et /
  return tel.replace(/[^\d\s\+\/]/g, '').trim()
}

/**
 * Parse le texte extrait du PDF pour en extraire les données structurées
 */
export function parseConventionText(text: string): ConventionData {
  const data: ConventionData = {}
  
  // Normaliser les espaces multiples mais garder les retours à la ligne pour certains patterns
  const originalText = text
  
  // 1. Informations étudiant
  // Nom et Prénom - chercher "Nom : HARROW" et "Prénom : Jean-Michel"
  const nomMatch = originalText.match(/Nom\s*:?\s*([A-Z\s\-]+?)(?:\s+Prénom|$)/i)
  if (nomMatch) {
    data.nom = nomMatch[1].trim()
  }
  
  const prenomMatch = originalText.match(/Prénom\s*:?\s*([A-Za-z\s\-]+?)(?:\s+Sexe|$)/i)
  if (prenomMatch) {
    data.prenom = prenomMatch[1].trim()
  }
  
  // Alternative: chercher à la fin du document "STAGIAIRE ... Jean-Michel HARROW"
  if (!data.nom || !data.prenom) {
    const stagiaireMatch = originalText.match(/STAGIAIRE[\s\S]*?([A-Za-z\s\-]+?)\s+([A-Z\s\-]+?)(?:\s*$|\s*L'enseignant)/i)
    if (stagiaireMatch) {
      data.prenom = stagiaireMatch[1].trim()
      data.nom = stagiaireMatch[2].trim()
    }
  }
  
  // Email étudiant
  const emailMatch = originalText.match(/Mél\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (emailMatch) {
    data.email = emailMatch[1].trim()
  }
  
  // Numéro d'étudiant
  const numMatch = originalText.match(/Numéro\s+d'étudiant\s*:?\s*(\d+)/i)
  if (numMatch) {
    data.numeroEtudiant = numMatch[1].trim()
  }
  
  // 2. Année universitaire
  const anneeMatch = originalText.match(/Année\s+universitaire\s+(\d{4}\s*\/\s*\d{4})/i)
  if (anneeMatch) {
    const annee = formatAnneeUniversitaire(anneeMatch[1])
    data.anneeUniversitaire = annee ?? undefined
  }
  
  // 3. Département et Promotion
  const dept = extractDepartement(originalText)
  data.departement = dept ?? undefined
  const promo = extractPromotion(originalText)
  data.promotion = promo ?? undefined
  
  // 4. Sujet du stage
  // Format: "SUJET DE STAGE : 60% : ... 40% : ..."
  let sujetMatch = originalText.match(/SUJET\s+DE\s+STAGE\s*:?\s*([\s\S]+?)(?=Dates\s*:?\s*du)/i)
  if (!sujetMatch) {
    sujetMatch = originalText.match(/SUJET\s+DE\s+STAGE\s*:?\s*([\s\S]+?)(?:\s+Dates\s*:|Dates\s*:)/i)
  }
  if (sujetMatch) {
    let sujetText = sujetMatch[1].trim()
    sujetText = sujetText.replace(/\s+/g, ' ')
    // Limiter à 100 caractères (limite de la base de données)
    data.sujet = sujetText.length > 100 ? sujetText.substring(0, 97) + '...' : sujetText
  }
  
  // 5. Description (ACTIVITÉS CONFIÉES ou DESCRIPTION)
  // Essayer plusieurs patterns pour trouver la description
  let descriptionMatch = originalText.match(/ACTIVITÉS\s+CONFIÉES\s*:?\s*([\s\S]+?)(?:\s+Compétences|Compétences|Dates\s*:|$)/i)
  if (!descriptionMatch) {
    // Chercher "DESCRIPTION" ou "DESCRIPTION DU STAGE"
    descriptionMatch = originalText.match(/DESCRIPTION\s+(?:DU\s+STAGE\s*)?:?\s*([\s\S]+?)(?:\s+Compétences|Dates\s*:|$)/i)
  }
  if (!descriptionMatch) {
    // Dernier recours : chercher "Missions" ou "Tâches"
    descriptionMatch = originalText.match(/(?:Missions|Tâches|Taches)\s*:?\s*([\s\S]+?)(?:\s+Compétences|Dates\s*:|$)/i)
  }
  
  // Si toujours pas trouvé, essayer d'extraire le texte entre le sujet et les dates
  if (!descriptionMatch) {
    const sujetEndIndex = originalText.search(/SUJET\s+DE\s+STAGE/i)
    const datesStartIndex = originalText.search(/Dates\s*:?\s*du/i)
    if (sujetEndIndex !== -1 && datesStartIndex !== -1 && datesStartIndex > sujetEndIndex) {
      const sectionBetween = originalText.substring(sujetEndIndex, datesStartIndex)
      // Chercher du texte après "SUJET DE STAGE" qui pourrait être la description
      const potentialDescription = sectionBetween.replace(/SUJET\s+DE\s+STAGE\s*:?\s*/i, '').trim()
      if (potentialDescription.length > 50) {
        // Utiliser ce texte comme description
        let descriptionText = potentialDescription.replace(/\s+/g, ' ')
        descriptionText = descriptionText.replace(/\d+%\s*:?\s*/g, '')
        data.description = descriptionText.length > 5000 ? descriptionText.substring(0, 5000) : descriptionText
      }
    }
  } else if (descriptionMatch) {
    let descriptionText = descriptionMatch[1].trim()
    // Nettoyer le texte
    descriptionText = descriptionText.replace(/\s+/g, ' ')
    // Retirer les pourcentages et autres éléments qui pourraient être dans le sujet
    descriptionText = descriptionText.replace(/\d+%\s*:?\s*/g, '')
    // Limiter à une longueur raisonnable (la base de données accepte du texte)
    data.description = descriptionText.length > 5000 ? descriptionText.substring(0, 5000) : descriptionText
  }
  
  // 6. Dates du stage
  // Format: "Dates : du 05/01/2026 au 28/02/2026"
  let datesMatch = originalText.match(/Dates\s*:?\s*[\s\S]*?du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i)
  if (!datesMatch) {
    datesMatch = originalText.match(/Dates\s*:?\s*du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i)
  }
  if (!datesMatch) {
    datesMatch = originalText.match(/Dates\s*:?\s*(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/i)
  }
  if (datesMatch) {
    const dateDebut = formatDateToISO(datesMatch[1])
    data.dateDebut = dateDebut ?? undefined
    const dateFin = formatDateToISO(datesMatch[2])
    data.dateFin = dateFin ?? undefined
  }
  
  // 7. Informations entreprise (ORGANISME D'ACCUEIL)
  const entrepriseSection = originalText.match(/2\s*-\s*L'ORGANISME\s+D'ACCUEIL([\s\S]+?)(?:\s+3\s*-\s*LE\s+STAGIAIRE|$)/i)
  if (entrepriseSection) {
    const entrepriseText = entrepriseSection[1]
    
    // Nom - plusieurs patterns pour gérer les variations
    let entrepriseNomMatch = entrepriseText.match(/Nom\s*:?\s*([A-Z\s\-\.ÉÈÊÀ]+?)(?:\s+Adresse|Adresse|Représenté|$)/i)
    if (!entrepriseNomMatch) {
      entrepriseNomMatch = entrepriseText.match(/Nom\s*:?\s*([A-Z\s\-\.ÉÈÊÀ]{3,}?)(?:\n|Adresse)/i)
    }
    if (!entrepriseNomMatch) {
      entrepriseNomMatch = originalText.match(/ORGANISME\s+D'ACCUEIL[\s\S]{0,300}?Nom\s*:?\s*([A-Z\s\-\.ÉÈÊÀ]{3,}?)(?:\n|Adresse|Représenté)/i)
    }
    if (entrepriseNomMatch) {
      let nomEntreprise = entrepriseNomMatch[1].trim()
      nomEntreprise = nomEntreprise.replace(/\s+/g, ' ')
      data.entrepriseNom = nomEntreprise
    }
    
    // Adresse
    const adresseMatch = entrepriseText.match(/Adresse\s*:?\s*([A-Za-z0-9\s\-,\.]+?)(?:\s+Représenté|Tél|Mél|$)/i)
    if (adresseMatch) {
      data.entrepriseAdresse = adresseMatch[1].trim()
    }
    
    // Téléphone
    const telMatch = entrepriseText.match(/Tél\s*:?\s*([\d\s\+\-\(\)\/]+?)(?:\s+Mél|$)/i)
    if (telMatch) {
      data.entrepriseTelephone = cleanTelephone(telMatch[1])
    }
    
    // Email
    const entrepriseEmailMatch = entrepriseText.match(/Mél\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (entrepriseEmailMatch) {
      data.entrepriseEmail = entrepriseEmailMatch[1].trim()
    }
  }
  
  // 8. Informations tuteur
  // Chercher "Nom et prénom du tuteur de stage :" suivi du nom (peut être sur plusieurs lignes)
  let tuteurMatch = originalText.match(/Nom\s+et\s+prénom\s+du\s+tuteur\s+de\s+stage\s*:?\s*[\s\n]*([A-Z\s\-]+?)\s+([A-Za-z\s\-]+?)(?:\s+Fonction|Tél|Mél|$)/i)
  if (!tuteurMatch) {
    tuteurMatch = originalText.match(/tuteur\s+de\s+stage\s*:?\s*[\s\n]*([A-Z\s\-]+?)\s+([A-Za-z\s\-]+?)(?:\s+Fonction|Tél|Mél|$)/i)
  }
  if (!tuteurMatch) {
    tuteurMatch = originalText.match(/tuteur\s+de\s+stage[\s\S]*?([A-Z\s\-]+?)\s+([A-Za-z\s\-]+?)(?:\s*$|\s*Fiches)/i)
  }
  if (tuteurMatch) {
    data.tuteurNom = tuteurMatch[1].trim()
    data.tuteurPrenom = tuteurMatch[2].trim()
  }
  
  // Fonction du tuteur
  const fonctionMatch = originalText.match(/tuteur\s+de\s+stage[^:]*?Fonction\s*:?\s*([A-Za-z\s\-ÉÈÊÀ]+?)(?:\s+Tél|Mél|$)/i)
  if (fonctionMatch) {
    data.tuteurFonction = fonctionMatch[1].trim()
  }
  
  // Téléphone tuteur
  let tuteurTelMatch = originalText.match(/(?:tuteur\s+de\s+stage|Fonction[^:]*?)\s*Tél\s*:?\s*([\d\s\+\-\(\)\/]+?)(?:\s+Mél|$)/i)
  if (!tuteurTelMatch && data.tuteurNom) {
    const escapedNom = data.tuteurNom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    tuteurTelMatch = originalText.match(new RegExp(`${escapedNom}[^:]*?Tél\\s*:?\\s*([\\d\\s\\+\\-\\(\\)\\/]+?)(?:\\s+Mél|$)`, 'i'))
  }
  if (tuteurTelMatch) {
    data.tuteurTelephone = cleanTelephone(tuteurTelMatch[1])
  }
  
  // Email tuteur
  let tuteurEmailMatch = originalText.match(/(?:tuteur\s+de\s+stage|Tél[^:]*?)\s*Mél\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (!tuteurEmailMatch && data.tuteurNom) {
    const escapedNom = data.tuteurNom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    tuteurEmailMatch = originalText.match(new RegExp(`${escapedNom}[^:]*?Mél\\s*:?\\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})`, 'i'))
  }
  if (tuteurEmailMatch) {
    data.tuteurEmail = tuteurEmailMatch[1].trim()
  }
  
  // 9. Informations référent (optionnel)
  const referentMatch = originalText.match(/Nom\s+et\s+prénom\s+de\s+l'enseignant\s+référent\s*:?\s*([A-Z\s\-]+?)\s+([A-Za-z\s\-]+?)(?:\s+Tél|Mél|$)/i)
  if (referentMatch) {
    data.referentNom = referentMatch[1].trim()
    data.referentPrenom = referentMatch[2].trim()
  }
  
  const referentEmailMatch = originalText.match(/enseignant\s+référent[^:]*?Mél\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (referentEmailMatch) {
    data.referentEmail = referentEmailMatch[1].trim()
  }
  
  return data
}

/**
 * Valide que le texte extrait correspond bien à une convention de stage
 * @param text Le texte extrait du PDF
 * @returns Un objet avec isValid (boolean) et reason (string) si invalide
 */
export function validateConventionDocument(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Le document ne contient pas de texte extractible.' }
  }

  const normalizedText = text.toLowerCase()
  
  // Mots-clés obligatoires pour une convention de stage
  const requiredKeywords = [
    'convention',
    'stage'
  ]
  
  // Mots-clés fortement indicatifs d'une convention de stage
  const strongIndicators = [
    'iut',
    'étudiant',
    'entreprise',
    'tuteur',
    'stagiaire',
    'période de stage',
    'date de début',
    'date de fin'
  ]
  
  // Vérifier la présence des mots-clés obligatoires
  const hasRequiredKeywords = requiredKeywords.every(keyword => 
    normalizedText.includes(keyword)
  )
  
  if (!hasRequiredKeywords) {
    return { 
      isValid: false, 
      reason: 'Impossible d\'extraire les données du PDF. Le document ne semble pas être une convention de stage.\nVérifie que le fichier uploadé est bien une convention de stage IUT contenant les mentions de l\'étudiant, de l\'entreprise et du tuteur.' 
    }
  }
  
  // Compter les indicateurs forts présents
  const indicatorsFound = strongIndicators.filter(indicator => 
    normalizedText.includes(indicator)
  ).length
  
  // Si moins de 3 indicateurs forts sont présents, c'est suspect
  if (indicatorsFound < 3) {
    return { 
      isValid: false, 
      reason: 'Impossible d\'extraire les données du PDF. Le document ne semble pas être une convention de stage.\nVérifie que le fichier uploadé est bien une convention de stage IUT contenant les mentions de l\'étudiant, de l\'entreprise et du tuteur.' 
    }
  }
  
  return { isValid: true }
}

/**
 * Extrait le texte d'un PDF et parse les données de convention
 */
export async function parseConventionPDF(pdfBuffer: Buffer): Promise<ConventionData> {
  try {
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
    
    return parseConventionText(text)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de l'extraction du texte du PDF: ${error.message}`)
    }
    throw new Error('Erreur inconnue lors de l\'extraction du texte du PDF')
  }
}

