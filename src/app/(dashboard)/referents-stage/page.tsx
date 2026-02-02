'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Trash2, PlusCircle, Save, X, UserPlus, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type ReferentStage = {
  id: number
  departement: string
  promotion: number
  anneeUniversitaire: string
  enseignant: {
    id: number
    nom: string
    prenom: string
    email: string | null
  }
}

type Enseignant = {
  id: number
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  departement: string
}

const DEPARTEMENT_LABELS: Record<string, string> = {
  INFO: 'Informatique',
  GEA: 'Gestion des Entreprises et Administrations',
  HSE: 'Hygiène, Sécurité, Environnement',
  MLT: 'Métiers du Livre et du Patrimoine',
  TC: 'Techniques de Commercialisation'
}

// Génère les années universitaires depuis 2024-2025 jusqu'à 2030-2031
const generateAnneesUniversitaires = (): string[] => {
  const annees: string[] = []
  for (let annee = 2024; annee <= 2030; annee++) {
    annees.push(`${annee}-${annee + 1}`)
  }
  return annees
}

const ANNEES_UNIVERSITAIRES = generateAnneesUniversitaires()

export default function ReferentsStagePage() {
  const searchParams = useSearchParams()
  const [referents, setReferents] = useState<ReferentStage[]>([])
  const [enseignants, setEnseignants] = useState<Enseignant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingEnseignantId, setEditingEnseignantId] = useState<number | null>(null)
  const [showEnseignantForm, setShowEnseignantForm] = useState(false)
  const [deleteEnseignantDialogOpen, setDeleteEnseignantDialogOpen] = useState(false)
  const [enseignantToDelete, setEnseignantToDelete] = useState<{ id: number; nom: string; prenom: string; referentsCount: number } | null>(null)
  const [deleteReferentDialogOpen, setDeleteReferentDialogOpen] = useState(false)
  const [referentToDelete, setReferentToDelete] = useState<ReferentStage | null>(null)
  
  const [formData, setFormData] = useState({
    departement: searchParams.get('departement') || 'INFO',
    promotion: '',
    annee_universitaire: '',
    id_enseignant: ''
  })

  const [enseignantFormData, setEnseignantFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    departement: searchParams.get('departement') || 'INFO'
  })

  const fetchReferents = useCallback(async () => {
    try {
      const departement = searchParams.get('departement') || 'INFO'
      const res = await fetch(`/api/referents-stage?departement=${departement}`)
      const data = await res.json()
      setReferents(data)
    } catch (error) {
      console.error('Error fetching referents:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const fetchEnseignants = useCallback(async () => {
    try {
      const departement = searchParams.get('departement') || 'INFO'
      const res = await fetch(`/api/enseignants?departement=${departement}`)
      const data = await res.json()
      setEnseignants(data)
    } catch (error) {
      console.error('Error fetching enseignants:', error)
    }
  }, [searchParams])

  useEffect(() => {
    fetchReferents()
    fetchEnseignants()
  }, [fetchReferents, fetchEnseignants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/referents-stage/${editingId}`
        : '/api/referents-stage'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.error || 'Erreur lors de la sauvegarde')
        return
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        departement: searchParams.get('departement') || 'INFO',
        promotion: '',
        annee_universitaire: '',
        id_enseignant: ''
      })
      fetchReferents()
    } catch (error) {
      console.error('Error saving referent:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (referent: ReferentStage) => {
    setEditingId(referent.id)
    setFormData({
      departement: referent.departement,
      promotion: referent.promotion.toString(),
      annee_universitaire: referent.anneeUniversitaire,
      id_enseignant: referent.enseignant.id.toString()
    })
    setShowForm(true)
  }

  const handleDelete = (referent: ReferentStage) => {
    // Stocker le référent à supprimer pour le dialog
    setReferentToDelete(referent)
    // Ouvrir le dialog de confirmation
    setDeleteReferentDialogOpen(true)
  }

  const confirmDeleteReferent = async () => {
    if (!referentToDelete) return

    try {
      const res = await fetch(`/api/referents-stage?id=${referentToDelete.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        alert('Erreur lors de la suppression')
        return
      }

      // Fermer le dialog et réinitialiser
      setDeleteReferentDialogOpen(false)
      setReferentToDelete(null)

      // Rafraîchir la liste
      fetchReferents()
    } catch (error) {
      console.error('Error deleting referent:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleDeleteEnseignant = (id: number) => {
    // Trouver l'enseignant à supprimer
    const enseignant = enseignants.find(e => e.id === id)
    if (!enseignant) return

    // Vérifier si l'enseignant est utilisé comme référent
    const referentsUsingEnseignant = referents.filter(r => r.enseignant.id === id)
    
    // Stocker les informations pour le dialog
    setEnseignantToDelete({
      id: enseignant.id,
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      referentsCount: referentsUsingEnseignant.length
    })
    
    // Ouvrir le dialog de confirmation
    setDeleteEnseignantDialogOpen(true)
  }

  const confirmDeleteEnseignant = async () => {
    if (!enseignantToDelete) return

    try {
      const res = await fetch('/api/enseignants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [enseignantToDelete.id] })
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.error || 'Erreur lors de la suppression de l\'enseignant')
        return
      }

      // Fermer le dialog et réinitialiser
      setDeleteEnseignantDialogOpen(false)
      setEnseignantToDelete(null)

      // Rafraîchir les listes
      await fetchEnseignants()
      await fetchReferents()
    } catch (error) {
      console.error('Error deleting enseignant:', error)
      alert('Erreur lors de la suppression de l\'enseignant')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      departement: searchParams.get('departement') || 'INFO',
      promotion: '',
      annee_universitaire: '',
      id_enseignant: ''
    })
  }

  const handleEditEnseignant = (enseignant: Enseignant) => {
    setEditingEnseignantId(enseignant.id)
    setEnseignantFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      email: enseignant.email || '',
      telephone: enseignant.telephone || '',
      departement: enseignant.departement
    })
    setShowEnseignantForm(true)
  }

  const handleCreateEnseignant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingEnseignantId 
        ? `/api/enseignants/${editingEnseignantId}`
        : '/api/enseignants'
      
      const method = editingEnseignantId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enseignantFormData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.error || `Erreur lors de la ${editingEnseignantId ? 'modification' : 'création'} de l'enseignant`)
        return
      }

      const enseignant = await res.json()
      
      // Rafraîchir la liste des enseignants
      await fetchEnseignants()
      
      // Si on est en mode création et qu'on est dans le formulaire de référent, sélectionner automatiquement le nouvel enseignant
      if (!editingEnseignantId && showForm) {
        setFormData({ ...formData, id_enseignant: enseignant.id.toString() })
      }
      
      // Fermer le modal et réinitialiser le formulaire
      setShowEnseignantForm(false)
      setEditingEnseignantId(null)
      setEnseignantFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        departement: searchParams.get('departement') || 'INFO'
      })
    } catch (error) {
      console.error(`Error ${editingEnseignantId ? 'updating' : 'creating'} enseignant:`, error)
      alert(`Erreur lors de la ${editingEnseignantId ? 'modification' : 'création'} de l'enseignant`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Référents de stage</h1>
          <p className="text-muted-foreground">
            Désignez des enseignants de l&apos;IUT comme référents pédagogiques pour chaque promotion, département et année universitaire
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un référent
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier le référent' : 'Ajouter un référent'}</CardTitle>
            <CardDescription>
              Désignez un enseignant de l&apos;IUT comme référent pédagogique pour une promotion, un département et une année universitaire spécifiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Département</label>
                  <Select
                    value={formData.departement}
                    onValueChange={(value) => setFormData({ ...formData, departement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEPARTEMENT_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Promotion</label>
                  <Select
                    value={formData.promotion}
                    onValueChange={(value) => setFormData({ ...formData, promotion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">BUT 1</SelectItem>
                      <SelectItem value="2">BUT 2</SelectItem>
                      <SelectItem value="3">BUT 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Année universitaire</label>
                  <Select
                    value={formData.annee_universitaire}
                    onValueChange={(value) => setFormData({ ...formData, annee_universitaire: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANNEES_UNIVERSITAIRES.map((annee) => (
                        <SelectItem key={annee} value={annee}>
                          {annee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enseignant référent</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEnseignantForm(true)}
                      className="h-7 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Ajouter un enseignant
                    </Button>
                  </div>
                  <Select
                    value={formData.id_enseignant}
                    onValueChange={(value) => setFormData({ ...formData, id_enseignant: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {enseignants.map((enseignant) => (
                        <SelectItem key={enseignant.id} value={enseignant.id.toString()}>
                          {enseignant.prenom} {enseignant.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Section Enseignants */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des enseignants</CardTitle>
          <CardDescription>
            Liste des enseignants disponibles. Vous pouvez créer de nouveaux enseignants ou supprimer ceux qui ne sont plus nécessaires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enseignants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Aucun enseignant enregistré
              </p>
              <Button onClick={() => setShowEnseignantForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un enseignant
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Référents actifs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enseignants.map((enseignant) => {
                    const referentsCount = referents.filter(r => r.enseignant.id === enseignant.id).length
                    return (
                      <TableRow key={enseignant.id}>
                        <TableCell className="font-medium">{enseignant.nom}</TableCell>
                        <TableCell>{enseignant.prenom}</TableCell>
                        <TableCell>{enseignant.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {DEPARTEMENT_LABELS[enseignant.departement] || enseignant.departement}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {referentsCount > 0 ? (
                            <Badge variant="default">{referentsCount} référent{referentsCount > 1 ? 's' : ''}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucun</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEnseignant(enseignant)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEnseignant(enseignant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Référents de stage */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des référents de stage</CardTitle>
          <CardDescription>
            Enseignants de l&apos;IUT désignés comme référents pédagogiques par département, promotion et année universitaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : referents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Aucun référent configuré</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter votre premier référent de stage
              </p>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter un référent
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Département</TableHead>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Année universitaire</TableHead>
                  <TableHead>Référent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referents.map((referent) => (
                  <TableRow key={referent.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {DEPARTEMENT_LABELS[referent.departement] || referent.departement}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>BUT {referent.promotion}</Badge>
                    </TableCell>
                    <TableCell>{referent.anneeUniversitaire}</TableCell>
                    <TableCell className="font-medium">
                      {referent.enseignant.prenom} {referent.enseignant.nom}
                    </TableCell>
                    <TableCell>{referent.enseignant.email || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(referent)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(referent)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout/modification d'enseignant */}
      <Sheet open={showEnseignantForm} onOpenChange={(open) => {
        setShowEnseignantForm(open)
        if (!open) {
          setEditingEnseignantId(null)
          setEnseignantFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            departement: searchParams.get('departement') || 'INFO'
          })
        }
      }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingEnseignantId ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}</SheetTitle>
            <SheetDescription>
              {editingEnseignantId 
                ? 'Modifiez les informations de l\'enseignant'
                : 'Créez un nouvel enseignant qui pourra être désigné comme référent de stage'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateEnseignant} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                type="text"
                placeholder="Nom"
                value={enseignantFormData.nom}
                onChange={(e) => setEnseignantFormData({ ...enseignantFormData, nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom *</label>
              <Input
                type="text"
                placeholder="Prénom"
                value={enseignantFormData.prenom}
                onChange={(e) => setEnseignantFormData({ ...enseignantFormData, prenom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={enseignantFormData.email}
                onChange={(e) => setEnseignantFormData({ ...enseignantFormData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={enseignantFormData.telephone}
                onChange={(e) => setEnseignantFormData({ ...enseignantFormData, telephone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Département</label>
              <Select
                value={enseignantFormData.departement}
                onValueChange={(value) => setEnseignantFormData({ ...enseignantFormData, departement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEPARTEMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingEnseignantId ? 'Enregistrer les modifications' : 'Créer l\'enseignant'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEnseignantForm(false)
                  setEditingEnseignantId(null)
                  setEnseignantFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    telephone: '',
                    departement: searchParams.get('departement') || 'INFO'
                  })
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmation de suppression d'enseignant */}
      <AlertDialog open={deleteEnseignantDialogOpen} onOpenChange={setDeleteEnseignantDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                <p className="font-medium mb-2">
                  Vous êtes sur le point de supprimer l&apos;enseignant suivant :
                </p>
                <p className="text-sm bg-muted p-3 rounded-md">
                  <strong>Nom :</strong> {enseignantToDelete?.prenom} {enseignantToDelete?.nom}
                </p>
              </div>

              {enseignantToDelete && enseignantToDelete.referentsCount > 0 && (
                <div>
                  <p className="font-medium mb-2 text-destructive">
                    ⚠️ Cet enseignant est actuellement référent pour {enseignantToDelete.referentsCount} promotion(s).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    La suppression de l&apos;enseignant supprimera également tous ses référents de stage associés.
                  </p>
                </div>
              )}

              <div>
                <p className="font-medium mb-2">Éléments qui seront supprimés :</p>
                <ul className="list-disc list-inside text-sm space-y-1 bg-muted p-3 rounded-md">
                  <li>L&apos;enseignant lui-même</li>
                  {enseignantToDelete && enseignantToDelete.referentsCount > 0 && (
                    <li>{enseignantToDelete.referentsCount} référent(s) de stage associé(s)</li>
                  )}
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Cette action est irréversible.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Êtes-vous sûr de vouloir continuer ?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteEnseignantDialogOpen(false)
              setEnseignantToDelete(null)
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEnseignant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de suppression de référent de stage */}
      <AlertDialog open={deleteReferentDialogOpen} onOpenChange={setDeleteReferentDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                <p className="font-medium mb-2">
                  Vous êtes sur le point de supprimer le référent de stage suivant :
                </p>
                <div className="text-sm bg-muted p-3 rounded-md space-y-2">
                  <p>
                    <strong>Enseignant :</strong> {referentToDelete?.enseignant.prenom} {referentToDelete?.enseignant.nom}
                  </p>
                  <p>
                    <strong>Département :</strong> {referentToDelete && (DEPARTEMENT_LABELS[referentToDelete.departement] || referentToDelete.departement)}
                  </p>
                  <p>
                    <strong>Promotion :</strong> BUT {referentToDelete?.promotion}
                  </p>
                  <p>
                    <strong>Année universitaire :</strong> {referentToDelete?.anneeUniversitaire}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Ce qui sera supprimé :</p>
                <ul className="list-disc list-inside text-sm space-y-1 bg-muted p-3 rounded-md">
                  <li>L&apos;association entre l&apos;enseignant et cette promotion/département/année</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm font-medium text-black dark:text-black mb-1">
                  ℹ️ Information importante
                </p>
                <p className="text-sm text-black dark:text-black">
                  L&apos;enseignant lui-même ne sera pas supprimé. Seule l&apos;association en tant que référent pour cette promotion/département/année sera retirée.
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Êtes-vous sûr de vouloir continuer ?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteReferentDialogOpen(false)
              setReferentToDelete(null)
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReferent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

