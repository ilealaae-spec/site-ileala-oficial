import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import axios from "axios";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT } from "jose";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.SITE_URL || 'https://www.ileala.ae'}/api/oauth/google/callback`;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
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
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const response = await axios.post<GoogleTokenResponse>(
    'https://oauth2.googleapis.com/token',
    {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    },
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
 * Create session token for user
 */
async function createSessionToken(userId: string, email: string, name: string): Promise<string> {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or SESSION_SECRET is not configured');
  }

  const secretKey = new TextEncoder().encode(secret);
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

  // Use email as openId for Google users (since we don't have a separate openId system)
  const openId = `google:${userId}`;

  return new SignJWT({
    openId,
    email,
    name,
    loginMethod: 'google',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
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
      // Exchange code for token
      const tokenResponse = await exchangeCodeForToken(code);
      
      // Get user info
      const userInfo = await getUserInfo(tokenResponse.access_token);

      if (!userInfo.email || !userInfo.verified_email) {
        return res.status(400).json({ error: 'Email not verified by Google' });
      }

      // Create or update user in database
      const openId = `google:${userInfo.id}`;
      await db.upsertUser({
        openId,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
        loginMethod: 'google',
        lastSignedIn: new Date(),
      });

      // Create session token using the same format as email/password login
      // Store user data in cookie as JSON (compatible with existing auth system)
      const sessionData = {
        id: openId, // Use openId as ID
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
        role: 'user',
        openId: openId,
        loginMethod: 'google',
      };

      // Set cookie with JSON data (same format as email/password login)
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, JSON.stringify(sessionData), {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to original destination or home
      const redirectTo = state ? decodeURIComponent(state) : '/';
      res.redirect(302, redirectTo);
    } catch (error) {
      console.error('[Google OAuth] Callback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed';
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  });

  // Google OAuth initiation
  app.get('/api/oauth/google', (req: Request, res: Response) => {
    try {
      const redirectTo = (req.query.redirect as string) || '/';
      const state = encodeURIComponent(redirectTo);
      const authUrl = getGoogleAuthUrl(state);
      res.redirect(302, authUrl);
    } catch (error) {
      console.error('[Google OAuth] Failed to generate auth URL:', error);
      res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  });
}

