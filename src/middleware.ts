import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware
 * 
 * Gère les headers de sécurité, la redirection, et autres logiques au niveau des routes
 * S'exécute avant chaque requête
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de sécurité supplémentaires (complémentaires à next.config.ts)
  // Ces headers sont appliqués dynamiquement selon la route
  const pathname = request.nextUrl.pathname

  // Headers pour les routes API
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    // CORS headers pour les routes API (ajuster selon vos besoins)
    const origin = request.headers.get('origin')
    if (origin && origin.includes(process.env.NEXT_PUBLIC_APP_URL || 'localhost')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }

  // Headers pour les fichiers statiques
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|pdf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Headers pour les pages HTML
  if (!pathname.startsWith('/api/') && !pathname.match(/\.(.*)$/)) {
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return response
}

/**
 * Configuration du matcher pour limiter l'exécution du middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}

