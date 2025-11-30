/**
 * Audit Logger for Security and Compliance
 * Records all admin actions for tracking and rollback
 */

import { getDb } from './db';
import { auditLogs } from '../drizzle/schema';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view';
export type AuditEntity = 'product' | 'category' | 'collection' | 'coupon' | 'user' | 'order' | 'newsletter' | 'media' | 'settings';

interface AuditLogData {
  userId?: number | string;
  userEmail: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: number;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Log an audit event
 * @param data - Audit log data
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Audit] Database not available');
      return;
    }

    // Convert userId to number if it's a string
    const userId = typeof data.userId === 'string' ? null : data.userId;

    await db.insert(auditLogs).values({
      userId: userId || null,
      userEmail: data.userEmail,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    console.log(`[Audit] ${data.action.toUpperCase()} ${data.entity} by ${data.userEmail}${data.entityId ? ` (ID: ${data.entityId})` : ''}`);
  } catch (error) {
    console.error('[Audit] Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit logs with pagination
 * @param options - Query options
 */
export async function getAuditLogs(options?: {
  userId?: number;
  action?: AuditAction;
  entity?: AuditEntity;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    let query = db.select().from(auditLogs);

    // Apply filters (simplified - in production use Drizzle's where clauses)
    const result = await query.limit(options?.limit || 100).offset(options?.offset || 0);

    return result;
  } catch (error) {
    console.error('[Audit] Failed to get audit logs:', error);
    throw error;
  }
}

/**
 * Helper to create audit log from tRPC context
 */
export function createAuditLogger(ctx: any) {
  return {
    log: (data: Omit<AuditLogData, 'userEmail' | 'ipAddress' | 'userAgent'>) => {
      const userEmail = ctx.user?.email || 'unknown';
      const ipAddress = getClientIp(ctx.req?.headers || {});
      const userAgent = ctx.req?.headers?.['user-agent'] || 'unknown';

      return logAudit({
        ...data,
        userId: ctx.user?.id,
        userEmail,
        ipAddress,
        userAgent,
      });
    },
  };
}

/**
 * Get client IP from request headers
 */
function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  const realIp = headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return 'unknown';
}
