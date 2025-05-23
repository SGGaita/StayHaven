import logger from './server-logger';

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
  }

  // Clean up old entries
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now - data.windowStart > this.windowMs) {
        this.store.delete(key);
      }
    }
  }

  // Check if request should be rate limited
  checkRateLimit(key) {
    this.cleanup();
    const now = Date.now();

    if (!this.store.has(key)) {
      this.store.set(key, {
        windowStart: now,
        count: 1
      });
      return { limited: false, remaining: this.maxRequests - 1 };
    }

    const data = this.store.get(key);
    
    // Reset if window has expired
    if (now - data.windowStart > this.windowMs) {
      this.store.set(key, {
        windowStart: now,
        count: 1
      });
      return { limited: false, remaining: this.maxRequests - 1 };
    }

    // Increment counter
    data.count += 1;
    this.store.set(key, data);

    // Check if rate limit exceeded
    if (data.count > this.maxRequests) {
      logger.authError('rate-limit', 'Rate limit exceeded', { key });
      return { limited: true, remaining: 0 };
    }

    return { limited: false, remaining: this.maxRequests - data.count };
  }
}

// Create instances for different rate limits
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth endpoints
export const passwordResetLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 requests per hour for password reset

export const rateLimitMiddleware = (limiter) => async (request) => {
  // Get IP address or other identifier
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  
  const { limited, remaining } = limiter.checkRateLimit(identifier);
  
  if (limited) {
    logger.authError('rate-limit', 'Request blocked by rate limiter', { identifier });
    return new Response(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': (Date.now() + limiter.windowMs).toString()
        }
      }
    );
  }
  
  return null;
}; 