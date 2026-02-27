import type { Express, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import * as db from './db';
import { sdk } from './_core/sdk';
import { getSessionCookieOptions } from './_core/cookies';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';

const APPLE_JWKS_URI = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_BUNDLE_ID = 'ae.ileala.app';

export function registerAppleAuthRoutes(app: Express) {
  app.post('/api/auth/apple', async (req: Request, res: Response) => {
    const { identityToken, givenName, familyName, email } = req.body;

    if (!identityToken) {
      return res.status(400).json({ error: 'identityToken is required' });
    }

    try {
      const JWKS = createRemoteJWKSet(new URL(APPLE_JWKS_URI));
      const { payload } = await jwtVerify(identityToken, JWKS, {
        issuer: APPLE_ISSUER,
        audience: APPLE_BUNDLE_ID,
      });

      const appleUserId = payload.sub as string;
      const userEmail = email || (payload.email as string) || null;
      const userName =
        [givenName, familyName].filter(Boolean).join(' ') ||
        userEmail?.split('@')[0] ||
        'Apple User';

      await db.upsertUser({
        openId: `apple:${appleUserId}`,
        name: userName,
        email: userEmail,
        loginMethod: 'apple',
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(`apple:${appleUserId}`, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.json({ success: true });
    } catch (error) {
      console.error('[Apple Auth] Failed:', error);
      return res.status(401).json({ error: 'Invalid Apple identity token' });
    }
  });
}
