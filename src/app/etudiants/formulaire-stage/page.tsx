'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GraduationCap, Building2, User, Briefcase, Send, Loader2, Upload, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

type FormData = {
  // Informations étudiant
  nom: string
  prenom: string
  email: string
  departement: string
  promotion: string
  anneeUniversitaire: string
  
  // Informations stage
  sujet: string
  description: string
  dateDebut: string
  dateFin: string
  
  // Informations entreprise
  entrepriseNom: string
  entrepriseAdresse: string
  entrepriseSecteur: string
  entrepriseTelephone: string
  entrepriseEmail: string
  entrepriseSiret: string
  entrepriseTaille: string
  entrepriseEstActive: string
  entrepriseRepresentantNom: string
  entrepriseRepresentantQualite: string
  
  // Informations tuteur
  tuteurNom: string
  tuteurPrenom: string
  tuteurTelephone: string
  tuteurEmail: string
}

export default function FormulaireStagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const departementParam = searchParams.get('departement') || 'INFO'
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null) // Stocker le fichier PDF uploadé
  const [formFilled, setFormFilled] = useState(false) // Indique si le formulaire a été prérempli depuis une convention
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
    departement: departementParam,
    promotion: '',
    anneeUniversitaire: getCurrentAcademicYear(),
    sujet: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    entrepriseNom: '',
    entrepriseAdresse: '',
    entrepriseSecteur: departementParam, // Le secteur est le code du département
    entrepriseTelephone: '',
    entrepriseEmail: '',
    entrepriseSiret: '',
    entrepriseTaille: '',
    entrepriseEstActive: 'true',
    entrepriseRepresentantNom: '',
    entrepriseRepresentantQualite: '',
    tuteurNom: '',
    tuteurPrenom: '',
    tuteurTelephone: '',
    tuteurEmail: '',
  })

  function getCurrentAcademicYear(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // 1-12
    
    // Si on est entre septembre et décembre, année universitaire = année actuelle - année suivante
    // Sinon, année universitaire = année précédente - année actuelle
    if (month >= 9) {
      return `${year}-${year + 1}`
    } else {
      return `${year - 1}-${year}`
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadMessage({ type: 'error', text: 'Le fichier doit être un PDF' })
      return
    }

    setUploading(true)
    setUploadMessage(null)

    try {
      // Envoyer le fichier à l'endpoint de parsing
      const parseFormData = new FormData()
      parseFormData.append('file', file)

      const response = await fetch('/api/parse-convention', {
        method: 'POST',
        body: parseFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Si le préremplissage n'est pas disponible, afficher un message informatif mais permettre de continuer
        if (result.isPreFillUnavailable) {
          setUploadMessage({ 
            type: 'warning', 
            text: result.error || 'Le préremplissage automatique n\'est pas disponible. Veuillez remplir le formulaire manuellement.' 
          })
          // Permettre à l'utilisateur de continuer à remplir le formulaire manuellement
          setFormFilled(true)
          setUploadedFile(file)
          return
        }
        
        // Si c'est une erreur de validation (document non conforme), afficher un message spécifique
        if (result.isValidationError) {
          throw new Error(result.error || 'Le document uploadé n\'est pas une convention de stage valide.')
        }
        throw new Error(result.error || 'Erreur lors du traitement du PDF')
      }

      // Préremplir le formulaire avec les données extraites
      const data = result.data
      const warnings = result.warnings || []

      setFormData(prev => ({
        ...prev,
        // Étudiant
        nom: data.nom || prev.nom,
        prenom: data.prenom || prev.prenom,
        email: data.email || prev.email,
        departement: data.departement || prev.departement,
        promotion: data.promotion || prev.promotion,
        anneeUniversitaire: data.anneeUniversitaire || prev.anneeUniversitaire,
        // Stage
        sujet: data.sujet || prev.sujet,
        description: data.description || prev.description,
        dateDebut: data.dateDebut || prev.dateDebut,
        dateFin: data.dateFin || prev.dateFin,
        // Entreprise
        entrepriseNom: data.entrepriseNom || prev.entrepriseNom,
        entrepriseAdresse: data.entrepriseAdresse || prev.entrepriseAdresse,
        // Le secteur est le code du département
        entrepriseSecteur: data.departement || data.entrepriseSecteur || prev.departement || prev.entrepriseSecteur,
        entrepriseTelephone: data.entrepriseTelephone || prev.entrepriseTelephone,
        entrepriseEmail: data.entrepriseEmail || prev.entrepriseEmail,
        entrepriseRepresentantNom: data.entrepriseRepresentantNom || prev.entrepriseRepresentantNom,
        entrepriseRepresentantQualite: data.entrepriseRepresentantQualite || prev.entrepriseRepresentantQualite,
        // Tuteur
        tuteurNom: data.tuteurNom || prev.tuteurNom,
        tuteurPrenom: data.tuteurPrenom || prev.tuteurPrenom,
        tuteurTelephone: data.tuteurTelephone || prev.tuteurTelephone,
        tuteurEmail: data.tuteurEmail || prev.tuteurEmail,
      }))

      // Stocker le fichier pour l'enregistrer lors de la soumission
      setUploadedFile(file)

      // Afficher le formulaire maintenant que les données sont extraites
      setFormFilled(true)

      // Afficher un message de succès ou d'avertissement
      if (warnings.length > 0) {
        setUploadMessage({ 
          type: 'warning', 
          text: `Formulaire prérempli avec succès. Avertissements : ${warnings.join(', ')}` 
        })
      } else {
        setUploadMessage({ 
          type: 'success', 
          text: 'Formulaire prérempli avec succès ! Vérifiez les informations et complétez si nécessaire.' 
        })
      }

      // Effacer les erreurs existantes
      setErrors({})

    } catch (error: unknown) {
      console.error('Erreur lors de l\'upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors du traitement du PDF'
      setUploadMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setUploading(false)
      // Réinitialiser l'input file pour permettre de re-uploader le même fichier
      e.target.value = ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation étudiant
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire'
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire'
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.promotion) newErrors.promotion = 'La promotion est obligatoire'
    if (!formData.anneeUniversitaire) newErrors.anneeUniversitaire = 'L\'année universitaire est obligatoire'

    // Validation stage
    if (!formData.sujet.trim()) newErrors.sujet = 'Le sujet est obligatoire'
    if (!formData.description.trim()) newErrors.description = 'La description est obligatoire'
    if (!formData.dateDebut) newErrors.dateDebut = 'La date de début est obligatoire'
    if (!formData.dateFin) newErrors.dateFin = 'La date de fin est obligatoire'
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut)
      const fin = new Date(formData.dateFin)
      if (fin < debut) {
        newErrors.dateFin = 'La date de fin doit être après la date de début'
      }
    }

    // Validation entreprise
    if (!formData.entrepriseNom.trim()) newErrors.entrepriseNom = 'Le nom de l\'entreprise est obligatoire'
    const secteurValue = formData.entrepriseSecteur.trim() || formData.departement
    if (!secteurValue) newErrors.entrepriseSecteur = 'Le secteur (département) est obligatoire'
    if (!formData.entrepriseSiret.trim()) {
      newErrors.entrepriseSiret = 'Le SIRET est obligatoire'
    } else if (!/^\d{14}$/.test(formData.entrepriseSiret.trim())) {
      newErrors.entrepriseSiret = 'Le SIRET doit contenir exactement 14 chiffres'
    }
    if (!formData.entrepriseTaille) newErrors.entrepriseTaille = 'La taille de l\'entreprise est obligatoire'
    if (!formData.entrepriseEstActive) newErrors.entrepriseEstActive = 'Le statut est obligatoire'

    // Validation tuteur
    if (!formData.tuteurNom.trim()) newErrors.tuteurNom = 'Le nom du tuteur est obligatoire'
    if (!formData.tuteurPrenom.trim()) newErrors.tuteurPrenom = 'Le prénom du tuteur est obligatoire'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/formulaire-stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Étudiant
          new_etudiant: {
            nom: formData.nom.trim(),
            prenom: formData.prenom.trim(),
            email: formData.email.trim() || undefined,
          },
          // Stage
          sujet: formData.sujet.trim(),
          description: formData.description.trim(),
          date_debut: formData.dateDebut,
          date_fin: formData.dateFin,
          promotion: formData.promotion,
          annee_universitaire: formData.anneeUniversitaire,
          departement: formData.departement,
          // Entreprise
          new_entreprise: {
            nom: formData.entrepriseNom.trim(),
            adresse: formData.entrepriseAdresse.trim() || undefined,
            secteur: (formData.entrepriseSecteur.trim() || formData.departement) as 'INFO' | 'GEA' | 'HSE' | 'MLT' | 'TC',
            telephone: formData.entrepriseTelephone.trim() || undefined,
            email: formData.entrepriseEmail.trim() || undefined,
            siret: formData.entrepriseSiret.trim(),
            tailleEntreprise: formData.entrepriseTaille as 'TPE' | 'PME' | 'ETI' | 'GE',
            estActive: formData.entrepriseEstActive === 'true',
            representantNom: formData.entrepriseRepresentantNom.trim() || undefined,
            representantQualite: formData.entrepriseRepresentantQualite.trim() || undefined,
          },
          // Tuteur
          new_tuteur: {
            nom: formData.tuteurNom.trim(),
            prenom: formData.tuteurPrenom.trim(),
            telephone: formData.tuteurTelephone.trim() || undefined,
            email: formData.tuteurEmail.trim() || undefined,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission du formulaire')
      }

      // Enregistrer la convention si un fichier a été uploadé
      if (uploadedFile && data.stage) {
        try {
          const conventionFormDataObj = new FormData()
          conventionFormDataObj.append('file', uploadedFile)
          conventionFormDataObj.append('idStage', data.stage.id.toString())
          conventionFormDataObj.append('nomEtudiant', formData.nom.trim())
          conventionFormDataObj.append('prenomEtudiant', formData.prenom.trim())
          conventionFormDataObj.append('nomEntreprise', formData.entrepriseNom.trim())
          conventionFormDataObj.append('departement', formData.departement)
          if (formData.promotion) {
            conventionFormDataObj.append('promotion', formData.promotion)
          }
          if (formData.anneeUniversitaire) {
            conventionFormDataObj.append('anneeUniversitaire', formData.anneeUniversitaire)
          }

          const conventionResponse = await fetch('/api/conventions-stage', {
            method: 'POST',
            body: conventionFormDataObj,
          })

          if (!conventionResponse.ok) {
            console.warn('Erreur lors de l\'enregistrement de la convention:', await conventionResponse.json())
            // On continue même si l'enregistrement de la convention échoue
          }
        } catch (conventionError) {
          console.warn('Erreur lors de l\'enregistrement de la convention:', conventionError)
          // On continue même si l'enregistrement de la convention échoue
        }
      }

      // Succès - rediriger vers le dashboard étudiant
      alert('Formulaire soumis avec succès ! Le stage a été enregistré.')
      router.push('/etudiants')
    } catch (error: unknown) {
      console.error('Erreur:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission du formulaire'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {!formFilled ? (
        // Section Upload PDF - Grande carte carrée centrée
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md border-dashed shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Préremplir depuis une convention PDF</CardTitle>
              <CardDescription className="text-base">
                Téléchargez la convention de stage pour préremplir automatiquement le formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="pdf-upload" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="cursor-pointer w-full py-6 text-lg"
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Télécharger la convention PDF
                      </>
                    )}
                  </span>
                </Button>
              </label>
              {uploadMessage && (
                <div
                  className={`flex items-start gap-2 p-4 rounded-md mt-4 w-full ${
                    uploadMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : uploadMessage.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {uploadMessage.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : uploadMessage.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {uploadMessage.type === 'success'
                        ? 'Succès'
                        : uploadMessage.type === 'warning'
                        ? 'Avertissement'
                        : 'Erreur'}
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-line">{uploadMessage.text}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Formulaire de stage</h1>
            <p className="text-muted-foreground">
              Vérifiez les informations extraites et complétez si nécessaire
            </p>
          </div>

          {/* Section Upload PDF - Visible mais compacte quand le formulaire est affiché */}
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Préremplir depuis une convention PDF</CardTitle>
              </div>
              <CardDescription>
                Téléchargez la convention de stage pour préremplir automatiquement le formulaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="pdf-upload-2"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Télécharger la convention PDF
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                {uploadMessage && (
                  <div
                    className={`flex items-start gap-2 p-4 rounded-md ${
                      uploadMessage.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : uploadMessage.type === 'warning'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {uploadMessage.type === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : uploadMessage.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {uploadMessage.type === 'success'
                          ? 'Succès'
                          : uploadMessage.type === 'warning'
                          ? 'Avertissement'
                          : 'Erreur'}
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-line">{uploadMessage.text}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Afficher le formulaire seulement si les données ont été extraites */}
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Étudiant */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Informations étudiant</CardTitle>
            </div>
            <CardDescription>Informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium">
                  Nom <span className="text-destructive">*</span>
                </label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Dupont"
                  className={errors.nom ? 'border-destructive' : ''}
                />
                {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium">
                  Prénom <span className="text-destructive">*</span>
                </label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Jean"
                  className={errors.prenom ? 'border-destructive' : ''}
                />
                {errors.prenom && <p className="text-sm text-destructive">{errors.prenom}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jean.dupont@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="departement" className="text-sm font-medium">
                  Département <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.departement}
                  onValueChange={(value) => handleChange('departement', value)}
                >
                  <SelectTrigger className={errors.departement ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="GEA">GEA</SelectItem>
                    <SelectItem value="HSE">HSE</SelectItem>
                    <SelectItem value="MLT">MLT</SelectItem>
                    <SelectItem value="TC">TC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.departement && <p className="text-sm text-destructive">{errors.departement}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="promotion" className="text-sm font-medium">
                  Promotion <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.promotion}
                  onValueChange={(value) => handleChange('promotion', value)}
                >
                  <SelectTrigger className={errors.promotion ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">BUT 1</SelectItem>
                    <SelectItem value="2">BUT 2</SelectItem>
                    <SelectItem value="3">BUT 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.promotion && <p className="text-sm text-destructive">{errors.promotion}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="anneeUniversitaire" className="text-sm font-medium">
                  Année universitaire <span className="text-destructive">*</span>
                </label>
                <Input
                  id="anneeUniversitaire"
                  value={formData.anneeUniversitaire}
                  onChange={(e) => handleChange('anneeUniversitaire', e.target.value)}
                  placeholder="2024-2025"
                  className={errors.anneeUniversitaire ? 'border-destructive' : ''}
                />
                {errors.anneeUniversitaire && <p className="text-sm text-destructive">{errors.anneeUniversitaire}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Stage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Informations stage</CardTitle>
            </div>
            <CardDescription>Détails du stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sujet" className="text-sm font-medium">
                Sujet du stage <span className="text-destructive">*</span>
              </label>
              <Input
                id="sujet"
                value={formData.sujet}
                onChange={(e) => handleChange('sujet', e.target.value)}
                placeholder="Développement d'une application web"
                className={errors.sujet ? 'border-destructive' : ''}
              />
              {errors.sujet && <p className="text-sm text-destructive">{errors.sujet}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Décrivez le stage en détail..."
                rows={5}
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description ? 'border-destructive' : ''
                }`}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="dateDebut" className="text-sm font-medium">
                  Date de début <span className="text-destructive">*</span>
                </label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => handleChange('dateDebut', e.target.value)}
                  className={errors.dateDebut ? 'border-destructive' : ''}
                />
                {errors.dateDebut && <p className="text-sm text-destructive">{errors.dateDebut}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="dateFin" className="text-sm font-medium">
                  Date de fin <span className="text-destructive">*</span>
                </label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => handleChange('dateFin', e.target.value)}
                  className={errors.dateFin ? 'border-destructive' : ''}
                />
                {errors.dateFin && <p className="text-sm text-destructive">{errors.dateFin}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Entreprise */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Informations entreprise</CardTitle>
            </div>
            <CardDescription>Informations sur l&apos;entreprise d&apos;accueil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="entrepriseNom" className="text-sm font-medium">
                Nom de l&apos;entreprise <span className="text-destructive">*</span>
              </label>
              <Input
                id="entrepriseNom"
                value={formData.entrepriseNom}
                onChange={(e) => handleChange('entrepriseNom', e.target.value)}
                placeholder="Acme Corporation"
                className={errors.entrepriseNom ? 'border-destructive' : ''}
              />
              {errors.entrepriseNom && <p className="text-sm text-destructive">{errors.entrepriseNom}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="entrepriseAdresse" className="text-sm font-medium">
                Adresse
              </label>
              <Input
                id="entrepriseAdresse"
                value={formData.entrepriseAdresse}
                onChange={(e) => handleChange('entrepriseAdresse', e.target.value)}
                placeholder="123 Rue de la République, 97200 Fort-de-France"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="entrepriseSecteur" className="text-sm font-medium">
                  Secteur (Département) <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.entrepriseSecteur || formData.departement}
                  onValueChange={(value) => handleChange('entrepriseSecteur', value)}
                >
                  <SelectTrigger className={errors.entrepriseSecteur ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner le département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="GEA">GEA</SelectItem>
                    <SelectItem value="HSE">HSE</SelectItem>
                    <SelectItem value="MLT">MLT</SelectItem>
                    <SelectItem value="TC">TC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.entrepriseSecteur && <p className="text-sm text-destructive">{errors.entrepriseSecteur}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="entrepriseTelephone" className="text-sm font-medium">
                  Téléphone
                </label>
                <Input
                  id="entrepriseTelephone"
                  type="tel"
                  value={formData.entrepriseTelephone}
                  onChange={(e) => handleChange('entrepriseTelephone', e.target.value)}
                  placeholder="05 96 12 34 56"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="entrepriseEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="entrepriseEmail"
                type="email"
                value={formData.entrepriseEmail}
                onChange={(e) => handleChange('entrepriseEmail', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="entrepriseSiret" className="text-sm font-medium">
                SIRET <span className="text-destructive">*</span>
              </label>
              <Input
                id="entrepriseSiret"
                value={formData.entrepriseSiret}
                onChange={(e) => handleChange('entrepriseSiret', e.target.value)}
                placeholder="12345678901234"
                maxLength={14}
                className={errors.entrepriseSiret ? 'border-destructive' : ''}
              />
              {errors.entrepriseSiret && <p className="text-sm text-destructive">{errors.entrepriseSiret}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="entrepriseTaille" className="text-sm font-medium">
                  Taille de l&apos;entreprise <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.entrepriseTaille}
                  onValueChange={(value) => handleChange('entrepriseTaille', value)}
                >
                  <SelectTrigger className={errors.entrepriseTaille ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TPE">TPE (Très Petite Entreprise)</SelectItem>
                    <SelectItem value="PME">PME (Petite et Moyenne Entreprise)</SelectItem>
                    <SelectItem value="ETI">ETI (Entreprise de Taille Intermédiaire)</SelectItem>
                    <SelectItem value="GE">GE (Grande Entreprise)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.entrepriseTaille && <p className="text-sm text-destructive">{errors.entrepriseTaille}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="entrepriseEstActive" className="text-sm font-medium">
                  Statut <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.entrepriseEstActive}
                  onValueChange={(value) => handleChange('entrepriseEstActive', value)}
                >
                  <SelectTrigger className={errors.entrepriseEstActive ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.entrepriseEstActive && <p className="text-sm text-destructive">{errors.entrepriseEstActive}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="entrepriseRepresentantNom" className="text-sm font-medium">
                Représenté par (nom du signataire de la convention)
              </label>
              <Input
                id="entrepriseRepresentantNom"
                value={formData.entrepriseRepresentantNom}
                onChange={(e) => handleChange('entrepriseRepresentantNom', e.target.value)}
                placeholder="M. PORTECOP Olivier"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="entrepriseRepresentantQualite" className="text-sm font-medium">
                Qualité du représentant
              </label>
              <Input
                id="entrepriseRepresentantQualite"
                value={formData.entrepriseRepresentantQualite}
                onChange={(e) => handleChange('entrepriseRepresentantQualite', e.target.value)}
                placeholder="Directeur de la Direction des Systèmes d'Information et du Numérique"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Tuteur */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>Informations tuteur</CardTitle>
            </div>
            <CardDescription>Informations sur le tuteur en entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tuteurNom" className="text-sm font-medium">
                  Nom du tuteur <span className="text-destructive">*</span>
                </label>
                <Input
                  id="tuteurNom"
                  value={formData.tuteurNom}
                  onChange={(e) => handleChange('tuteurNom', e.target.value)}
                  placeholder="Martin"
                  className={errors.tuteurNom ? 'border-destructive' : ''}
                />
                {errors.tuteurNom && <p className="text-sm text-destructive">{errors.tuteurNom}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="tuteurPrenom" className="text-sm font-medium">
                  Prénom du tuteur <span className="text-destructive">*</span>
                </label>
                <Input
                  id="tuteurPrenom"
                  value={formData.tuteurPrenom}
                  onChange={(e) => handleChange('tuteurPrenom', e.target.value)}
                  placeholder="Pierre"
                  className={errors.tuteurPrenom ? 'border-destructive' : ''}
                />
                {errors.tuteurPrenom && <p className="text-sm text-destructive">{errors.tuteurPrenom}</p>}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tuteurTelephone" className="text-sm font-medium">
                  Téléphone
                </label>
                <Input
                  id="tuteurTelephone"
                  type="tel"
                  value={formData.tuteurTelephone}
                  onChange={(e) => handleChange('tuteurTelephone', e.target.value)}
                  placeholder="05 96 12 34 56"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tuteurEmail" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="tuteurEmail"
                  type="email"
                  value={formData.tuteurEmail}
                  onChange={(e) => handleChange('tuteurEmail', e.target.value)}
                  placeholder="pierre.martin@entreprise.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Soumettre le formulaire
              </>
            )}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  )
}

