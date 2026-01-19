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
  'SITE_URL',
] as const;

// Frontend variables (used during build)
const FRONTEND_ENV_VARS = [
  'VITE_APP_TITLE',
  'VITE_APP_ID',
  'VITE_APP_URL',

] as const;

/**
 * Validates environment variables and provides detailed feedback
 */
function validateEnvVars() {
  const missing: string[] = [];
  const invalid: Array<{ name: string; reason: string }> = [];
  
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      // Additional validation
      if (varName === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
        invalid.push({ name: varName, reason: 'Must start with postgresql://' });
      }
      if (varName === 'JWT_SECRET' && value.length < 32) {
        invalid.push({ name: varName, reason: 'Must be at least 32 characters long' });
      }
    }
  }
  
  // Check recommended variables
  const missingRecommended: string[] = [];
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingRecommended.push(varName);
    } else {
      // Additional validation
      if (varName === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
        invalid.push({ name: varName, reason: 'Must start with sk_live_ or sk_test_' });
      }
      if (varName === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_')) {
        invalid.push({ name: varName, reason: 'Must start with whsec_' });
      }
      if (varName === 'RESEND_API_KEY' && !value.startsWith('re_')) {
        invalid.push({ name: varName, reason: 'Must start with re_' });
      }
      if (varName === 'SITE_URL' && !value.startsWith('https://')) {
        invalid.push({ name: varName, reason: 'Must start with https://' });
      }
    }
  }
  
  // Check frontend variables (warn only)
  const missingFrontend: string[] = [];
  for (const varName of FRONTEND_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingFrontend.push(varName);
    }
  }
  
  // Report errors
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please configure these variables before starting the server.`
    );
  }
  
  if (invalid.length > 0) {
    const invalidMessages = invalid.map(i => `  - ${i.name}: ${i.reason}`).join('\n');
    throw new Error(
      `❌ Invalid environment variables:\n${invalidMessages}\n` +
      `Please correct these variables before starting the server.`
    );
  }
  
  // Report warnings
  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Warning: Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      `Some features may not work correctly.`
    );
  }
  
  if (missingFrontend.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Warning: Missing frontend environment variables: ${missingFrontend.join(', ')}\n` +
      `These are used during build time. The build may fail or have issues.`
    );
  }
  
  // Success message in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Environment variables validation passed');
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
  appId: process.env.VITE_APP_ID || "ileala-prod",
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
  // Emergency admin credentials - set via Railway environment variables
  emergencyAdminEmail: process.env.EMERGENCY_ADMIN_EMAIL ?? "",
  emergencyAdminPassword: process.env.EMERGENCY_ADMIN_PASSWORD ?? "",
};
