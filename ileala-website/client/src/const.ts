// Application constants
// Last updated: 2025-11-17 11:42 UTC - Force rebuild with env vars
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Check if OAuth is properly configured (not placeholder)
  const isPlaceholder = oauthPortalUrl?.includes('placeholder.com') || 
                         oauthPortalUrl === 'https://placeholder.com' ||
                         !oauthPortalUrl || 
                         !appId;
  
  if (isPlaceholder) {
    console.warn('OAuth is not configured. Please set VITE_OAUTH_PORTAL_URL and VITE_APP_ID environment variables.');
    return null; // Return null instead of '#' to indicate not configured
  }
  
  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error('Failed to construct login URL:', error);
    return null;
  }
};

// Check if OAuth is available
export const isOAuthAvailable = () => {
  return getLoginUrl() !== null;
};

// Generate Google OAuth login URL
export const getGoogleLoginUrl = (redirectTo: string = '/') => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!googleClientId || googleClientId.includes('placeholder')) {
    return null;
  }
  
  const state = encodeURIComponent(redirectTo);
  const redirectUri = `${window.location.origin}/api/oauth/google/callback`;
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Check if Google OAuth is available
export const isGoogleOAuthAvailable = () => {
  return getGoogleLoginUrl() !== null;
};