#!/usr/bin/env node

/**
 * Post-build script to replace VITE_* placeholders in index.html
 * Uses hardcoded values to ensure reliability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded values (no dependency on .env file)
const replacements = {
  '%VITE_APP_TITLE%': 'ILE ALA - Luxury Home & Table Linens',
  '%VITE_APP_URL%': 'https://admin.ileala.ae',
  '%VITE_APP_ID%': 'ileala-admin',
  '%VITE_SITE_URL%': 'https://admin.ileala.ae',
  '%VITE_FRONTEND_FORGE_API_URL%': 'https://www.ileala.ae',
  '%VITE_GOOGLE_CLIENT_ID%': '',
  '%VITE_OAUTH_PORTAL_URL%': '',
  '%VITE_LEGACY_BUILD%': 'true',
  '%VITE_STRIPE_PUBLISHABLE_KEY%': '',
};

// Path to index.html
const indexPath = path.resolve(__dirname, '../dist/public/index.html');

console.log('🔍 Looking for index.html at:', indexPath);

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found!');
  console.error('📂 Checking dist directory structure...');
  
  const distPath = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ dist/ exists');
    const distContents = fs.readdirSync(distPath);
    console.log('📁 Contents:', distContents);
  } else {
    console.error('❌ dist/ does not exist!');
  }
  
  process.exit(1);
}

// Read index.html
let html = fs.readFileSync(indexPath, 'utf-8');

console.log('📝 Original title:', html.match(/<title>([^<]+)<\/title>/)?.[1]);

// Replace all placeholders
Object.entries(replacements).forEach(([placeholder, value]) => {
  const count = (html.match(new RegExp(placeholder, 'g')) || []).length;
  if (count > 0) {
    html = html.replace(new RegExp(placeholder, 'g'), value);
    console.log(`✅ Replaced ${count}x: ${placeholder} → ${value}`);
  }
});

// Write back
fs.writeFileSync(indexPath, html, 'utf-8');

console.log('📝 New title:', html.match(/<title>([^<]+)<\/title>/)?.[1]);
console.log('✅ Post-build processing completed!');
