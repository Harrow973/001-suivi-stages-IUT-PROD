/**
 * Système de rate limiting simple en mémoire
 * Pour la production, considérer une solution distribuée (Redis, Upstash, etc.)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Nettoyer les entrées expirées toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  private getKey(identifier: string): string {
    return identifier;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(identifier);
    const now = Date.now();

    // Nettoyer si l'entrée a expiré
    if (this.store[key] && this.store[key].resetTime < now) {
      delete this.store[key];
    }

    // Créer une nouvelle fenêtre si nécessaire
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Vérifier la limite
    if (this.store[key].count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime,
      };
    }

    // Incrémenter le compteur
    this.store[key].count++;

    return {
      allowed: true,
      remaining: this.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store = {};
  }
}

// Instances de rate limiter pour différents endpoints
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requêtes par minute
export const uploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads par minute
export const chatRateLimiter = new RateLimiter(30, 60000); // 30 messages par minute

/**
 * Extrait l'IP client de manière sécurisée pour le rate limiting.
 * En production derrière Nginx : X-Real-IP est défini par le proxy (fiable).
 * X-Forwarded-For peut être spoofé si l'app est exposée directement.
 */
function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')
  const forwarded = request.headers.get('x-forwarded-for')
  // En production derrière un proxy de confiance, privilégier X-Real-IP
  const isBehindTrustedProxy = process.env.NODE_ENV === 'production'
  if (isBehindTrustedProxy && realIp) {
    return realIp.trim()
  }
  // Sinon : dernier IP de X-Forwarded-For (côté client) ou X-Real-IP
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim()
    if (firstIp) return firstIp
  }
  return realIp?.trim() || 'unknown'
}

/**
 * Middleware helper pour vérifier le rate limit
 */
export function checkRateLimit(
  request: Request,
  limiter: RateLimiter
): { allowed: boolean; response?: Response } {
  const ip = getClientIp(request)
  const result = limiter.check(ip)

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

