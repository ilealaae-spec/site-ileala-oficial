/**
 * Session Manager Module
 * Manages user sessions for single-session enforcement and session tracking
 */

import { randomBytes } from 'crypto';
import UAParser from 'ua-parser-js';
import * as db from './db';

/**
 * Generate a unique session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    deviceType: result.device.type || 'desktop',
  };
}

/**
 * Create a new session
 */
export async function createSession(
  userId: number,
  ip: string,
  userAgent: string,
  expiresInDays: number = 365
): Promise<string> {
  const sessionToken = generateSessionToken();
  const deviceInfo = parseUserAgent(userAgent);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  await db.createUserSession({
    userId,
    sessionToken,
    ip,
    userAgent,
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    expiresAt,
  });
  
  console.log(`[Session] Created session for user ${userId}`);
  return sessionToken;
}

/**
 * Validate session token
 */
export async function validateSession(sessionToken: string): Promise<number | null> {
  const session = await db.getUserSession(sessionToken);
  
  if (!session) {
    return null;
  }
  
  // Check if expired
  if (new Date() > new Date(session.expiresAt)) {
    await db.deleteUserSession(sessionToken);
    console.log(`[Session] Expired session deleted: ${sessionToken}`);
    return null;
  }
  
  // Update last activity
  await db.updateSessionActivity(sessionToken);
  
  return session.userId;
}

/**
 * Terminate all sessions for a user (except current)
 */
export async function terminateOtherSessions(userId: number, currentSessionToken?: string) {
  await db.deleteUserSessionsExcept(userId, currentSessionToken);
  console.log(`[Session] Terminated other sessions for user ${userId}`);
}

/**
 * Terminate all sessions for a user
 */
export async function terminateAllSessions(userId: number) {
  await db.deleteAllUserSessions(userId);
  console.log(`[Session] Terminated all sessions for user ${userId}`);
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(userId: number) {
  return await db.getUserSessions(userId);
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions() {
  const deleted = await db.deleteExpiredSessions();
  console.log(`[Session] Cleaned up ${deleted} expired sessions`);
  return deleted;
}

/**
 * Terminate a specific session
 */
export async function terminateSession(sessionToken: string) {
  await db.deleteUserSession(sessionToken);
  console.log(`[Session] Terminated session: ${sessionToken}`);
}
