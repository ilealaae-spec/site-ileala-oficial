/**
 * Rate Limiter for Login Protection
 * Prevents brute force attacks by limiting login attempts
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// In-memory store for rate limiting (consider Redis for production scaling)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  maxAttemptsPerMinute: 5,
  maxAttemptsTotal: 10,
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Clean up old entries to prevent memory leak
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than 1 hour
    if (now - entry.firstAttempt > 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldEntries, 10 * 60 * 1000);

/**
 * Check if IP is rate limited
 * @param ip - Client IP address
 * @returns Object with isBlocked status and remaining attempts
 */
export function checkRateLimit(ip: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  blockedUntil?: Date;
  message?: string;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No previous attempts
  if (!entry) {
    return {
      isBlocked: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttemptsPerMinute,
    };
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const blockedUntilDate = new Date(entry.blockedUntil);
    const minutesRemaining = Math.ceil((entry.blockedUntil - now) / 60000);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      blockedUntil: blockedUntilDate,
      message: `Too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
    };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    // Reset the window
    rateLimitStore.delete(ip);
    return {
      isBlocked: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttemptsPerMinute,
    };
  }

  // Within window, check attempts
  const remaining = RATE_LIMIT_CONFIG.maxAttemptsPerMinute - entry.attempts;
  
  if (remaining <= 0) {
    return {
      isBlocked: true,
      remainingAttempts: 0,
      message: `Too many login attempts. Please wait 1 minute before trying again.`,
    };
  }

  return {
    isBlocked: false,
    remainingAttempts: remaining,
  };
}

/**
 * Record a failed login attempt
 * @param ip - Client IP address
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First attempt
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
    });
    return;
  }

  // Check if window has expired
  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    // Reset with new window
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
    });
    return;
  }

  // Increment attempts
  entry.attempts += 1;

  // Check if should block
  if (entry.attempts >= RATE_LIMIT_CONFIG.maxAttemptsTotal) {
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    console.warn(`[SECURITY] IP ${ip} blocked for ${RATE_LIMIT_CONFIG.blockDurationMs / 60000} minutes due to ${entry.attempts} failed login attempts`);
  }

  rateLimitStore.set(ip, entry);
}

/**
 * Clear rate limit for IP (e.g., after successful login)
 * @param ip - Client IP address
 */
export function clearRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Get client IP from request headers
 * Handles proxies and load balancers
 */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  // Check common proxy headers
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  const realIp = headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  const cfConnectingIp = headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
  }

  // Fallback to unknown
  return 'unknown';
}
