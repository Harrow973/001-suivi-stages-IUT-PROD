'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileCheck, Download, ExternalLink } from 'lucide-react'

export default function ValidationsStagePage() {
  const pdfPath = '/documents/Fiche de validation de stage - IUT Martinique - BUT Informatique - 2025-2026.pdf'
  const pdfFileName = 'Fiche de validation de stage - IUT Martinique - BUT Informatique - 2025-2026.pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfPath
    link.download = pdfFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fiches de validation de stage</h1>
        <p className="text-muted-foreground">
          Téléchargez ou consultez la fiche de validation de stage officielle de l&apos;IUT Martinique
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            <CardTitle>Fiche de validation de stage - IUT Martinique - BUT Informatique 2025-2026</CardTitle>
          </div>
          <CardDescription>
            Document officiel pour la validation des stages des étudiants du BUT Informatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le document
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(pdfPath, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>

          <div className="mt-6 border rounded-lg overflow-hidden">
            <iframe
              src={pdfPath}
              className="w-full h-[600px]"
              title="Fiche de validation de stage"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

