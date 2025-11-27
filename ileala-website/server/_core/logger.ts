/**
 * Logger utility for production-safe logging
 * Removes console.logs in production, keeps errors and warnings
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  /**
   * Log info messages (always, for Railway debugging)
   */
  info: (...args: unknown[]) => {
    console.log('[INFO]', ...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log warnings (always, but less verbose in production)
   */
  warn: (...args: unknown[]) => {
    if (isProduction) {
      // In production, only log the message, not the full stack
      console.warn('[WARN]', args[0]);
    } else {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log errors (always, but structured in production)
   */
  error: (...args: unknown[]) => {
    if (isProduction) {
      // In production, log as structured JSON for easier parsing
      const error = args[0];
      if (error instanceof Error) {
        console.error(JSON.stringify({
          level: 'error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          ...(args[1] && typeof args[1] === 'object' ? args[1] : {}),
        }));
      } else {
        console.error(JSON.stringify({
          level: 'error',
          message: String(error),
          timestamp: new Date().toISOString(),
        }));
      }
    } else {
      console.error('[ERROR]', ...args);
    }
  },
};

