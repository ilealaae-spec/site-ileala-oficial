import { Express, Request, Response } from 'express';
import axios from 'axios';
import * as db from '../db';
import { getSessionCookieOptions } from './cookies';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { ENV } from './env';
import bcrypt from 'bcryptjs';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string, requestOrigin?: string): Promise<GoogleTokenResponse> {
  // Use SITE_URL from env, but fallback to request origin if available
  const redirectUri = `${ENV.siteUrl}/api/oauth/google/callback`;
  const params = new URLSearchParams({
    code,
    client_id: ENV.googleClientId,
    client_secret: ENV.googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await axios.post<GoogleTokenResponse>(
    'https://oauth2.googleapis.com/token',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
}

/**
 * Get user info from Google using access token
 */
async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await axios.get<GoogleUserInfo>(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

/**
 * Register Google OAuth routes
 */
export function registerGoogleOAuthRoutes(app: Express) {
  // Google OAuth callback
  app.get('/api/oauth/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string | undefined;
    const error = req.query.error as string | undefined;

    if (error) {
      console.error('[Google OAuth] Error:', error);
      return res.redirect(`/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
      console.log('[Google OAuth] Exchanging code for token...');
      // Exchange code for token
      const tokenResponse = await exchangeCodeForToken(code);
      
      console.log('[Google OAuth] Getting user info...');
      // Get user info
      const userInfo = await getUserInfo(tokenResponse.access_token);

      if (!userInfo.email || !userInfo.verified_email) {
        return res.status(400).json({ error: 'Email not verified by Google' });
      }

      console.log('[Google OAuth] User info:', { email: userInfo.email, name: userInfo.name });

      // Create or update user in database
      const openId = `google:${userInfo.id}`;
      
      // Check if user exists
      const existingUser = await db.getUserByOpenId(openId);
      
      if (existingUser) {
        // Update existing user
        await db.upsertUser({
          openId,
          email: userInfo.email,
          name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
          loginMethod: 'google',
          lastSignedIn: new Date(),
        });
        console.log('[Google OAuth] User updated:', existingUser.id);
      } else {
        // Create new user
        await db.upsertUser({
          openId,
          email: userInfo.email,
          name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
          loginMethod: 'google',
          lastSignedIn: new Date(),
        });
        console.log('[Google OAuth] New user created');
      }

      // Get user from database to create session
      const user = await db.getUserByOpenId(openId);
      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }

      // Create session token using the same format as email/password login
      // Store user data in cookie as JSON (compatible with existing auth system)
      const sessionData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        openId: openId,
        loginMethod: 'google',
      };

      // Set cookie with JSON data (same format as email/password login)
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, JSON.stringify(sessionData), {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      console.log('[Google OAuth] Session created, redirecting...');

      // Redirect to original destination or home
      // Add ?oauth_success=1 to trigger frontend refresh
      const redirectTo = state ? decodeURIComponent(state) : '/';
      const separator = redirectTo.includes('?') ? '&' : '?';
      res.redirect(302, `${redirectTo}${separator}oauth_success=1`);
    } catch (error) {
      console.error('[Google OAuth] Callback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed';
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  });

  // Google OAuth initiation (optional - not needed if frontend handles it)
  app.get('/api/oauth/google', (req: Request, res: Response) => {
    try {
      const redirectTo = (req.query.redirect as string) || '/';
      const state = encodeURIComponent(redirectTo);
      const redirectUri = `${ENV.siteUrl}/api/oauth/google/callback`;
      const params = new URLSearchParams({
        client_id: ENV.googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
        state,
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      res.redirect(302, authUrl);
    } catch (error) {
      console.error('[Google OAuth] Failed to generate auth URL:', error);
      res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  });
}




