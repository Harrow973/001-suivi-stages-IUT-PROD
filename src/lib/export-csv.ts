/**
 * Fonction utilitaire pour exporter des données en CSV
 */

import JSZip from 'jszip'

/** Caractères de début de formule Excel (CSV injection) */
const FORMULA_START_CHARS = ['=', '+', '-', '@', '\t', '\r']

/**
 * Échappe une valeur pour le format CSV.
 * Protège contre la CSV injection (formules Excel : =, +, -, @).
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  let stringValue = String(value)
  // Préfixer par une apostrophe pour neutraliser les formules Excel
  if (FORMULA_START_CHARS.some((c) => stringValue.startsWith(c))) {
    stringValue = "'" + stringValue
  }
  // Si la valeur contient des virgules, des guillemets ou des retours à la ligne, on l'entoure de guillemets
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

/**
 * Convertit un tableau de données en CSV
 */
function convertToCSV(headers: string[], rows: string[][]): string {
  const csvRows: string[] = []
  
  // En-têtes
  csvRows.push(headers.map(escapeCSV).join(','))
  
  // Lignes de données
  rows.forEach(row => {
    csvRows.push(row.map(escapeCSV).join(','))
  })
  
  return csvRows.join('\n')
}

/**
 * Télécharge un fichier CSV
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Ajouter le BOM UTF-8 pour une meilleure compatibilité avec Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Télécharge un fichier ZIP
 */
function downloadZIP(zipBlob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(zipBlob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporte les stages en CSV
 */
export function exportStagesToCSV(stages: any[]): void {
  const headers = [
    'ID',
    'Sujet',
    'Description',
    'Date de début',
    'Date de fin',
    'Statut',
    'Département',
    'Promotion',
    'Année universitaire',
    'Étudiant',
    'Entreprise',
    'Tuteur',
    'Date de création'
  ]
  
  const rows = stages.map(stage => [
    stage.id?.toString() || '',
    stage.sujet || '',
    stage.description || '',
    stage.dateDebut ? new Date(stage.dateDebut).toLocaleDateString('fr-FR') : '',
    stage.dateFin ? new Date(stage.dateFin).toLocaleDateString('fr-FR') : '',
    stage.statut || '',
    stage.departement || '',
    stage.promotion?.toString() || '',
    stage.anneeUniversitaire || '',
    stage.etudiant ? `${stage.etudiant.prenom} ${stage.etudiant.nom}` : '',
    stage.entreprise?.nom || '',
    stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : '',
    stage.createdAt ? new Date(stage.createdAt).toLocaleDateString('fr-FR') : ''
  ])
  
  const csv = convertToCSV(headers, rows)
  const filename = `stages_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Exporte les étudiants en CSV
 */
export function exportEtudiantsToCSV(etudiants: any[]): void {
  const headers = [
    'ID',
    'Nom',
    'Prénom',
    'Email',
    'Promotion',
    'Année universitaire',
    'Tuteur',
    'Entreprise du tuteur',
    'Nombre de stages'
  ]
  
  const rows = etudiants.map(etudiant => [
    etudiant.id?.toString() || '',
    etudiant.nom || '',
    etudiant.prenom || '',
    etudiant.email || '',
    etudiant.promotion?.toString() || '',
    etudiant.anneeUniversitaire || '',
    etudiant.tuteur ? `${etudiant.tuteur.prenom} ${etudiant.tuteur.nom}` : '',
    etudiant.tuteur?.entreprise?.nom || '',
    etudiant._count?.stages?.toString() || '0'
  ])
  
  const csv = convertToCSV(headers, rows)
  const filename = `etudiants_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Exporte les entreprises en CSV
 */
export function exportEntreprisesToCSV(entreprises: any[]): void {
  const headers = [
    'ID',
    'Nom',
    'Secteur',
    'Adresse',
    'Téléphone',
    'Email',
    'Nombre de stages',
    'Nombre de tuteurs'
  ]
  
  const rows = entreprises.map(entreprise => [
    entreprise.id?.toString() || '',
    entreprise.nom || '',
    entreprise.secteur || '',
    entreprise.adresse || '',
    entreprise.telephone || '',
    entreprise.email || '',
    entreprise._count?.stages?.toString() || '0',
    entreprise._count?.tuteurs?.toString() || '0'
  ])
  
  const csv = convertToCSV(headers, rows)
  const filename = `entreprises_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Exporte les tuteurs en CSV
 */
export function exportTuteursToCSV(tuteurs: any[]): void {
  const headers = [
    'ID',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Entreprise',
    'Nombre de stages'
  ]
  
  const rows = tuteurs.map(tuteur => [
    tuteur.id?.toString() || '',
    tuteur.nom || '',
    tuteur.prenom || '',
    tuteur.email || '',
    tuteur.telephone || '',
    tuteur.entreprise?.nom || '',
    tuteur._count?.stages?.toString() || '0'
  ])
  
  const csv = convertToCSV(headers, rows)
  const filename = `tuteurs_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Exporte toutes les données d'un département dans un seul fichier ZIP
 */
export async function exportAllDepartementData(departement: string): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0]
    
    // Récupérer toutes les données
    const [stagesRes, etudiantsRes, entreprisesRes, tuteursRes] = await Promise.all([
      fetch(`/api/stages?departement=${departement}`),
      fetch(`/api/etudiants?departement=${departement}`),
      fetch(`/api/entreprises?departement=${departement}`),
      fetch(`/api/tuteurs?departement=${departement}`)
    ])
    
    const stages = await stagesRes.json()
    const etudiants = await etudiantsRes.json()
    const entreprises = await entreprisesRes.json()
    const tuteurs = await tuteursRes.json()
    
    // Créer une instance JSZip
    const zip = new JSZip()
    const BOM = '\uFEFF' // BOM UTF-8 pour Excel
    
    // Exporter les stages
    if (stages.length > 0) {
      const headers = [
        'ID',
        'Sujet',
        'Description',
        'Date de début',
        'Date de fin',
        'Statut',
        'Département',
        'Promotion',
        'Année universitaire',
        'Étudiant',
        'Entreprise',
        'Tuteur',
        'Date de création'
      ]
      
      const rows = stages.map((stage: any) => [
        stage.id?.toString() || '',
        stage.sujet || '',
        stage.description || '',
        stage.dateDebut ? new Date(stage.dateDebut).toLocaleDateString('fr-FR') : '',
        stage.dateFin ? new Date(stage.dateFin).toLocaleDateString('fr-FR') : '',
        stage.statut || '',
        stage.departement || '',
        stage.promotion?.toString() || '',
        stage.anneeUniversitaire || '',
        stage.etudiant ? `${stage.etudiant.prenom} ${stage.etudiant.nom}` : '',
        stage.entreprise?.nom || '',
        stage.tuteur ? `${stage.tuteur.prenom} ${stage.tuteur.nom}` : '',
        stage.createdAt ? new Date(stage.createdAt).toLocaleDateString('fr-FR') : ''
      ])
      
      const csv = convertToCSV(headers, rows)
      zip.file(`${departement}_stages_${date}.csv`, BOM + csv)
    }
    
    // Exporter les étudiants
    if (etudiants.length > 0) {
      const headers = [
        'ID',
        'Nom',
        'Prénom',
        'Email',
        'Promotion',
        'Année universitaire',
        'Tuteur',
        'Entreprise du tuteur',
        'Nombre de stages'
      ]
      
      const rows = etudiants.map((etudiant: any) => [
        etudiant.id?.toString() || '',
        etudiant.nom || '',
        etudiant.prenom || '',
        etudiant.email || '',
        etudiant.promotion?.toString() || '',
        etudiant.anneeUniversitaire || '',
        etudiant.tuteur ? `${etudiant.tuteur.prenom} ${etudiant.tuteur.nom}` : '',
        etudiant.tuteur?.entreprise?.nom || '',
        etudiant._count?.stages?.toString() || '0'
      ])
      
      const csv = convertToCSV(headers, rows)
      zip.file(`${departement}_etudiants_${date}.csv`, BOM + csv)
    }
    
    // Exporter les entreprises
    if (entreprises.length > 0) {
      const headers = [
        'ID',
        'Nom',
        'Secteur',
        'Adresse',
        'Téléphone',
        'Email',
        'Nombre de stages',
        'Nombre de tuteurs'
      ]
      
      const rows = entreprises.map((entreprise: any) => [
        entreprise.id?.toString() || '',
        entreprise.nom || '',
        entreprise.secteur || '',
        entreprise.adresse || '',
        entreprise.telephone || '',
        entreprise.email || '',
        entreprise._count?.stages?.toString() || '0',
        entreprise._count?.tuteurs?.toString() || '0'
      ])
      
      const csv = convertToCSV(headers, rows)
      zip.file(`${departement}_entreprises_${date}.csv`, BOM + csv)
    }
    
    // Exporter les tuteurs
    if (tuteurs.length > 0) {
      const headers = [
        'ID',
        'Nom',
        'Prénom',
        'Email',
        'Téléphone',
        'Entreprise',
        'Nombre de stages'
      ]
      
      const rows = tuteurs.map((tuteur: any) => [
        tuteur.id?.toString() || '',
        tuteur.nom || '',
        tuteur.prenom || '',
        tuteur.email || '',
        tuteur.telephone || '',
        tuteur.entreprise?.nom || '',
        tuteur._count?.stages?.toString() || '0'
      ])
      
      const csv = convertToCSV(headers, rows)
      zip.file(`${departement}_tuteurs_${date}.csv`, BOM + csv)
    }
    
    // Générer le fichier ZIP et le télécharger
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const filename = `${departement}_export_complet_${date}.zip`
    downloadZIP(zipBlob, filename)
    
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    throw error
  }
}

