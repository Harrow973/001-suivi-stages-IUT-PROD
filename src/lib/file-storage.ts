/**
 * Gestion du stockage des fichiers uploadés
 * Les fichiers sont stockés hors du dossier public/ pour plus de sécurité
 */

import { join } from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';

const STORAGE_DIR = join(process.cwd(), 'storage');
const UPLOADS_DIR = join(STORAGE_DIR, 'uploads');
const CONVENTIONS_DIR = join(UPLOADS_DIR, 'conventions');
const VALIDATIONS_DIR = join(UPLOADS_DIR, 'validations');

/**
 * Initialise les dossiers de stockage s'ils n'existent pas
 */
export async function ensureStorageDirs(): Promise<void> {
  const dirs = [STORAGE_DIR, UPLOADS_DIR, CONVENTIONS_DIR, VALIDATIONS_DIR];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Obtient le chemin complet pour un fichier de convention
 */
export function getConventionPath(fileName: string): string {
  return join(CONVENTIONS_DIR, fileName);
}

/**
 * Obtient le chemin complet pour un fichier de validation
 */
export function getValidationPath(fileName: string): string {
  return join(VALIDATIONS_DIR, fileName);
}

/**
 * Génère un nom de fichier unique et sécurisé
 */
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now();
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${sanitized}`;
}

/**
 * Obtient le chemin relatif pour le stockage en base de données
 * (utilisé pour identifier le fichier, pas pour l'accès direct)
 */
export function getStorageRelativePath(fileName: string, type: 'convention' | 'validation'): string {
  return type === 'convention' 
    ? `storage/uploads/conventions/${fileName}`
    : `storage/uploads/validations/${fileName}`;
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime un fichier
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignorer les erreurs si le fichier n'existe pas
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Extrait le nom de fichier d'un chemin stocké en base
 */
export function extractFileName(cheminFichier: string): string {
  return cheminFichier.split('/').pop() || cheminFichier;
}

/**
 * Détermine si un chemin est un ancien chemin (public/) ou nouveau (storage/)
 */
export function isOldPath(cheminFichier: string): boolean {
  return cheminFichier.startsWith('/uploads/') || cheminFichier.startsWith('uploads/');
}

/**
 * Vérifie que le buffer contient un PDF valide via les magic bytes.
 * Les PDF commencent par %PDF (0x25 0x50 0x44 0x46).
 * Évite d'accepter des fichiers malveillants renommés en .pdf
 */
export function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF';
}

/**
 * Sanitise un nom de fichier pour l'affichage et le stockage en base.
 * Supprime les séquences path traversal et les caractères de contrôle.
 */
export function sanitizeFileNameForDisplay(originalName: string): string {
  const withoutPath = originalName.replace(/\.\./g, '').split(/[/\\]/).pop() || 'document.pdf';
  return withoutPath.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 255) || 'document.pdf';
}

