/**
 * Login Notifications Module
 * Tracks login attempts and sends notifications for suspicious activity
 */

import { UAParser } from 'ua-parser-js';
import * as db from './db';
import { sendEmail } from './email';

interface LoginAttempt {
  userId: number;
  email: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    deviceType: result.device.type || 'desktop',
    deviceModel: result.device.model || '',
  };
}

/**
 * Check if this is a new device/IP for the user
 */
async function isNewDevice(userId: number, ip: string, userAgent: string): Promise<boolean> {
  try {
    const recentLogins = await db.getRecentLoginHistory(userId, 30); // Last 30 days
    
    if (recentLogins.length === 0) {
      return true; // First login
    }
    
    // Check if IP or device combination is new
    const deviceInfo = parseUserAgent(userAgent);
    
    const matchingLogin = recentLogins.find(login => 
      login.ip === ip && 
      login.browser === deviceInfo.browser &&
      login.os === deviceInfo.os
    );
    
    return !matchingLogin;
  } catch (error) {
    console.error('[Login Notifications] Error checking new device:', error);
    return false;
  }
}

/**
 * Send login notification email
 */
async function sendLoginNotification(
  email: string,
  ip: string,
  deviceInfo: ReturnType<typeof parseUserAgent>,
  timestamp: Date
) {
  const subject = '🔒 New Login to Your ILE ALA Account';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">New Login Detected</h2>
      <p>We detected a new login to your ILE ALA admin account:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
        <p style="margin: 5px 0;"><strong>Device:</strong> ${deviceInfo.deviceType}</p>
        <p style="margin: 5px 0;"><strong>Browser:</strong> ${deviceInfo.browser} ${deviceInfo.browserVersion}</p>
        <p style="margin: 5px 0;"><strong>Operating System:</strong> ${deviceInfo.os} ${deviceInfo.osVersion}</p>
      </div>
      
      <p><strong>Was this you?</strong></p>
      <p>If you recognize this activity, you can ignore this email.</p>
      
      <p style="color: #e74c3c;"><strong>If you did NOT log in:</strong></p>
      <ul>
        <li>Change your password immediately</li>
        <li>Enable Two-Factor Authentication (2FA)</li>
        <li>Review your recent account activity</li>
        <li>Contact support if you need assistance</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #7f8c8d; font-size: 12px;">
        This is an automated security notification from ILE ALA. Please do not reply to this email.
      </p>
    </div>
  `;
  
  try {
    await sendEmail(email, subject, html);
    console.log(`[Login Notifications] Sent notification to ${email}`);
  } catch (error) {
    console.error('[Login Notifications] Failed to send email:', error);
  }
}

/**
 * Send failed login alert
 */
async function sendFailedLoginAlert(
  email: string,
  ip: string,
  attempts: number,
  timestamp: Date
) {
  const subject = '⚠️ Multiple Failed Login Attempts on Your Account';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Security Alert: Failed Login Attempts</h2>
      <p>We detected <strong>${attempts} failed login attempts</strong> on your ILE ALA admin account:</p>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
        <p style="margin: 5px 0;"><strong>Attempts:</strong> ${attempts}</p>
      </div>
      
      <p style="color: #e74c3c;"><strong>Action Required:</strong></p>
      <ul>
        <li>If this was you, please check your password</li>
        <li>If this was NOT you, change your password immediately</li>
        <li>Enable Two-Factor Authentication (2FA) for extra security</li>
        <li>Contact support if you need assistance</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #7f8c8d; font-size: 12px;">
        This is an automated security notification from ILE ALA. Please do not reply to this email.
      </p>
    </div>
  `;
  
  try {
    await sendEmail(email, subject, html);
    console.log(`[Login Notifications] Sent failed login alert to ${email}`);
  } catch (error) {
    console.error('[Login Notifications] Failed to send alert:', error);
  }
}

/**
 * Record login attempt and send notifications if needed
 */
export async function recordLoginAttempt(attempt: LoginAttempt) {
  try {
    const deviceInfo = attempt.userAgent 
      ? parseUserAgent(attempt.userAgent) 
      : { browser: 'Unknown', browserVersion: '', os: 'Unknown', osVersion: '', deviceType: 'desktop', deviceModel: '' };
    
    // Save to database
    await db.createLoginHistory({
      userId: attempt.userId,
      ip: attempt.ip,
      userAgent: attempt.userAgent || null,
      success: attempt.success ? 1 : 0,
      failureReason: attempt.failureReason || null,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
    });
    
    // Send notifications
    if (attempt.success) {
      // Check if new device
      const isNew = attempt.userAgent 
        ? await isNewDevice(attempt.userId, attempt.ip, attempt.userAgent)
        : false;
      
      if (isNew) {
        await sendLoginNotification(
          attempt.email,
          attempt.ip,
          deviceInfo,
          new Date()
        );
        
        // Mark notification as sent
        await db.markLoginNotificationSent(attempt.userId, attempt.ip);
      }
    } else {
      // Check for multiple failed attempts
      const recentFailed = await db.getRecentFailedLogins(attempt.userId, 1); // Last 1 hour
      
      if (recentFailed >= 3) {
        await sendFailedLoginAlert(
          attempt.email,
          attempt.ip,
          recentFailed,
          new Date()
        );
      }
    }
  } catch (error) {
    console.error('[Login Notifications] Error recording login attempt:', error);
  }
}

/**
 * Get login history for a user
 */
export async function getLoginHistory(userId: number, days: number = 30) {
  return await db.getRecentLoginHistory(userId, days);
}
