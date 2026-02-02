/**
 * Utilitaires côté client pour la gestion des URLs de fichiers
 */

/**
 * Convertit un chemin de fichier stocké en base de données vers l'URL de l'API
 * Supporte les anciens chemins (public/uploads/) et les nouveaux (storage/)
 */
export function getFileUrl(cheminFichier: string | null | undefined): string | null {
  if (!cheminFichier) return null;

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (cheminFichier.startsWith('http://') || cheminFichier.startsWith('https://')) {
    return cheminFichier;
  }

  // Si c'est un ancien chemin (public/uploads/), le convertir
  if (cheminFichier.startsWith('/uploads/') || cheminFichier.startsWith('uploads/')) {
    const fileName = cheminFichier.split('/').pop() || '';
    return `/api/files/convention/${fileName}`;
  }

  // Si c'est un nouveau chemin (storage/), extraire le nom de fichier
  const fileName = cheminFichier.split('/').pop() || '';
  
  // Déterminer le type de fichier
  let type: 'convention' | 'validation' = 'convention';
  if (cheminFichier.includes('validation')) {
    type = 'validation';
  }

  // Retourner l'URL de l'API
  return `/api/files/${type}/${fileName}`;
}

