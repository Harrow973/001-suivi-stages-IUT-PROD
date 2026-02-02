/**
 * Gestion centralisée des erreurs pour les routes API
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'Une erreur est survenue',
  statusCode: number = 500
): NextResponse<ApiError> {
  // Erreur de validation Zod
  if (error instanceof ZodError) {
    logger.warn('Erreur de validation', { issues: error.issues });
    return NextResponse.json(
      {
        error: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      },
      { status: 400 }
    );
  }

  // Erreur Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown };
    
    // Erreur de contrainte unique
    if (prismaError.code === 'P2002') {
      logger.warn('Violation de contrainte unique', { code: prismaError.code, meta: prismaError.meta });
      return NextResponse.json(
        {
          error: 'Cette entrée existe déjà',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        },
        { status: 409 }
      );
    }

    // Erreur de contrainte de clé étrangère
    if (prismaError.code === 'P2003') {
      logger.warn('Violation de contrainte de clé étrangère', { code: prismaError.code, meta: prismaError.meta });
      return NextResponse.json(
        {
          error: 'Impossible de supprimer : des enregistrements sont liés à cette entrée',
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
        },
        { status: 409 }
      );
    }

    // Enregistrement non trouvé
    if (prismaError.code === 'P2025') {
      logger.warn('Enregistrement non trouvé', { code: prismaError.code });
      return NextResponse.json(
        {
          error: 'Enregistrement non trouvé',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }
  }

  // Erreur générique
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  logger.error(defaultMessage, error instanceof Error ? error : new Error(errorMessage));

  return NextResponse.json(
    {
      error: errorMessage,
      code: 'INTERNAL_ERROR',
    },
    { status: statusCode }
  );
}

/**
 * Wrapper pour les handlers de route API avec gestion d'erreur automatique
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

