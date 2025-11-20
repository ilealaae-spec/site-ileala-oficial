// api/oauth/callback.ts - Vercel Serverless Function for OAuth callback
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../../server/db";
import { getSessionCookieOptions } from "../../server/_core/cookies";
import { sdk } from "../../server/_core/sdk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;

  if (!code || !state) {
    return res.status(400).json({ error: 'code and state are required' });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      return res.status(400).json({ error: 'openId missing from user info' });
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    // Get cookie options - handle both Express and Vercel request formats
    const cookieOptions = getSessionCookieOptions(req as any);
    
    // Build cookie string
    const cookieParts = [
      `${COOKIE_NAME}=${encodeURIComponent(sessionToken)}`,
      `Path=${cookieOptions.path || '/'}`,
      `Max-Age=${Math.floor(ONE_YEAR_MS / 1000)}`,
    ];
    
    if (cookieOptions.secure) {
      cookieParts.push('Secure');
    }
    if (cookieOptions.httpOnly) {
      cookieParts.push('HttpOnly');
    }
    cookieParts.push(`SameSite=${cookieOptions.sameSite || 'Lax'}`);
    
    if (cookieOptions.domain) {
      cookieParts.push(`Domain=${cookieOptions.domain}`);
    }
    
    // Set cookie using Vercel's response object
    res.setHeader('Set-Cookie', cookieParts.join('; '));

    // Redirect to home
    res.redirect(302, '/');
  } catch (error) {
    console.error('[OAuth] Callback failed:', error);
    return res.status(500).json({ error: 'OAuth callback failed' });
  }
}
