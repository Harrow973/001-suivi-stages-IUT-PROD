/**
 * Route API pour servir les fichiers uploadés de manière sécurisée
 * GET /api/files/convention/:filename
 * GET /api/files/validation/:filename
 * 
 * Cette route vérifie que le fichier existe et le sert avec les bons headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { getConventionPath, getValidationPath, fileExists } from '@/lib/file-storage';
import { logger } from '@/lib/logger';

// Route segment config - Les fichiers peuvent être mis en cache car ils changent rarement
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache pendant 1 heure

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    const { type, filename } = await params;

    // Valider le type
    if (type !== 'convention' && type !== 'validation') {
      return NextResponse.json(
        { error: 'Type de fichier invalide' },
        { status: 400 }
      );
    }

    // Sécuriser le nom de fichier (empêcher les path traversal)
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (safeFilename !== filename) {
      logger.warn('Tentative d\'accès avec un nom de fichier suspect', { filename, safeFilename });
      return NextResponse.json(
        { error: 'Nom de fichier invalide' },
        { status: 400 }
      );
    }

    // Obtenir le chemin du fichier
    const filePath = type === 'convention' 
      ? getConventionPath(safeFilename)
      : getValidationPath(safeFilename);

    // Vérifier que le fichier existe
    if (!(await fileExists(filePath))) {
      logger.warn('Tentative d\'accès à un fichier inexistant', { type, filename: safeFilename });
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath);

    // Déterminer le content-type
    const contentType = filename.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf'
      : 'application/octet-stream';

    // Retourner le fichier avec les bons headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    try {
      const { type, filename } = await params;
      logger.error('Erreur lors de la récupération du fichier', error as Error, {
        type,
        filename,
      });
    } catch {
      logger.error('Erreur lors de la récupération du fichier', error as Error);
    }
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du fichier' },
      { status: 500 }
    );
  }
}

