// Required environment variables (critical for app to function)
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

// Optional but recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

/**
 * Validates that all required environment variables are set.
 * Throws an error if any are missing.
 */
function validateEnvVars() {
  const missing: string[] = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please configure these variables before starting the server.`
    );
  }
  
  // Warn about missing recommended variables
  const missingRecommended: string[] = [];
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingRecommended.push(varName);
    }
  }
  
  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Warning: Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      `Some features may not work correctly.`
    );
  }
}

// Validate on module load
try {
  validateEnvVars();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Failed to validate environment variables');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  siteUrl: process.env.SITE_URL || 'https://www.ileala.ae',
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
};
