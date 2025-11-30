/**
 * Two-Factor Authentication (2FA) Module
 * Implements TOTP (Time-based One-Time Password) for enhanced security
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Configure TOTP
authenticator.options = {
  window: 1, // Allow 1 step before/after for clock drift
  step: 30,  // 30 seconds validity
};

/**
 * Generate a new 2FA secret for a user
 */
export function generate2FASecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate QR code data URL for Google Authenticator
 * @param email - User's email
 * @param secret - TOTP secret
 * @param issuer - App name (default: "ILE ALA")
 */
export async function generate2FAQRCode(
  email: string,
  secret: string,
  issuer: string = 'ILE ALA'
): Promise<string> {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return await QRCode.toDataURL(otpauth);
}

/**
 * Verify a TOTP token
 * @param token - 6-digit code from authenticator app
 * @param secret - User's TOTP secret
 */
export function verify2FAToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('[2FA] Verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 * @param count - Number of backup codes to generate (default: 10)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Verify a backup code
 * @param code - Backup code entered by user
 * @param backupCodes - JSON string of backup codes from database
 */
export function verifyBackupCode(code: string, backupCodes: string | null): {
  valid: boolean;
  remainingCodes?: string[];
} {
  if (!backupCodes) {
    return { valid: false };
  }

  try {
    const codes: string[] = JSON.parse(backupCodes);
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const index = codes.findIndex(c => 
      c.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedCode
    );

    if (index === -1) {
      return { valid: false };
    }

    // Remove used code
    const remainingCodes = codes.filter((_, i) => i !== index);
    
    return {
      valid: true,
      remainingCodes,
    };
  } catch (error) {
    console.error('[2FA] Backup code verification error:', error);
    return { valid: false };
  }
}

/**
 * Check if user has 2FA enabled
 */
export function is2FAEnabled(user: any): boolean {
  return user?.twoFactorEnabled === 1 && !!user?.twoFactorSecret;
}

/**
 * Hash backup codes for secure storage (optional enhancement)
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}
