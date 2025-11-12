import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents spam, brute force attacks, and abuse
 */

// Register endpoint: Limit account creation
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 registrations per IP
  message: 'Too many accounts created from this IP. Please try again in 15 minutes.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  handler: (req, res) => {
    console.log(`[RateLimit] Registration blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many accounts created from this IP. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

// Email verification endpoint: Limit verification attempts
export const verifyEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 verification attempts per IP
  message: 'Too many verification attempts. Please try again in 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful verifications
  handler: (req, res) => {
    console.log(`[RateLimit] Email verification blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many verification attempts. Please try again in 5 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

// Resend verification email endpoint: Limit email sending
export const resendEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 resends per IP per hour
  message: 'Too many email resend requests. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`[RateLimit] Email resend blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many email resend requests. Please try again in 1 hour.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

// Login endpoint: Prevent brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per IP
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    console.log(`[RateLimit] Login blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many login attempts. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

// Password reset endpoint: Limit reset requests
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 password reset requests per IP per hour
  message: 'Too many password reset requests. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`[RateLimit] Password reset blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many password reset requests. Please try again in 1 hour.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

// General API rate limiter (fallback)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`[RateLimit] API request blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many requests from this IP. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  },
});

/**
 * Rate limit configuration summary:
 * 
 * | Endpoint          | Limit | Window  | Skip Success |
 * |-------------------|-------|---------|--------------|
 * | Register          | 3     | 15 min  | No           |
 * | Verify Email      | 10    | 5 min   | Yes          |
 * | Resend Email      | 3     | 1 hour  | No           |
 * | Login             | 5     | 15 min  | Yes          |
 * | Password Reset    | 3     | 1 hour  | No           |
 * | General API       | 100   | 15 min  | No           |
 */
