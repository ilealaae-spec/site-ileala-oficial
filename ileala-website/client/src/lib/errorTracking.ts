/**
 * Error tracking utility
 * Currently logs to console, but can be extended to send to Sentry, LogRocket, etc.
 */

interface ErrorContext {
  userId?: string | number;
  userEmail?: string;
  path?: string;
  timestamp?: string;
  userAgent?: string;
  [key: string]: any;
}

class ErrorTracker {
  private isProduction = process.env.NODE_ENV === 'production';
  private enabled = true;

  /**
   * Track an error
   */
  captureException(error: Error, context?: ErrorContext) {
    if (!this.enabled) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    if (this.isProduction) {
      // In production, send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { custom: context } });
      console.error('[Error Tracking]', JSON.stringify(errorData));
      
      // You can send to your error tracking endpoint here
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
    } else {
      // In development, log to console
      console.error('[Error Tracking]', errorData);
    }
  }

  /**
   * Track a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (!this.enabled) return;

    const messageData = {
      message,
      level,
      ...context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    if (this.isProduction) {
      // In production, send to error tracking service
      console.log(`[Error Tracking ${level.toUpperCase()}]`, JSON.stringify(messageData));
    } else {
      // In development, log to console
      console.log(`[Error Tracking ${level.toUpperCase()}]`, messageData);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string | number, email?: string) {
    if (typeof window !== 'undefined') {
      (window as any).__ERROR_TRACKING_USER__ = { userId, email };
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (typeof window !== 'undefined') {
      delete (window as any).__ERROR_TRACKING_USER__;
    }
  }

  /**
   * Enable/disable error tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Auto-capture unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.captureException(event.error, {
      type: 'unhandled',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorTracker.captureException(error, {
      type: 'unhandledRejection',
    });
  });
}

