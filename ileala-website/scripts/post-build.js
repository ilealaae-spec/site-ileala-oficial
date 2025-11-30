#!/usr/bin/env node

/**
 * Post-build script to replace VITE_* placeholders in index.html
 * This ensures environment variables are properly injected even if Vite fails to process them
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const env = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
}

// Default values
const defaults = {
  VITE_APP_TITLE: 'ILE ALA - Luxury Home & Table Linens',
  VITE_APP_URL: 'https://admin.ileala.ae',
  VITE_APP_ID: 'ileala-admin',
  VITE_SITE_URL: 'https://admin.ileala.ae',
  VITE_FRONTEND_FORGE_API_URL: 'https://www.ileala.ae',
  VITE_GOOGLE_CLIENT_ID: '',
  VITE_OAUTH_PORTAL_URL: '',
  VITE_LEGACY_BUILD: 'true',
  VITE_STRIPE_PUBLISHABLE_KEY: '',
};

// Merge with defaults
Object.keys(defaults).forEach(key => {
  if (!env[key]) {
    env[key] = defaults[key];
  }
});

// Path to index.html
const indexPath = path.resolve(__dirname, '../dist/public/index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  process.exit(1);
}

// Read index.html
let html = fs.readFileSync(indexPath, 'utf-8');

// Replace all %VITE_*% placeholders
Object.keys(env).forEach(key => {
  const placeholder = `%${key}%`;
  const value = env[key];
  html = html.replace(new RegExp(placeholder, 'g'), value);
});

// Write back
fs.writeFileSync(indexPath, html, 'utf-8');

console.log('✅ Post-build processing completed!');
console.log('📝 Replaced variables:');
Object.keys(env).forEach(key => {
  console.log(`   ${key}: ${env[key]}`);
});
