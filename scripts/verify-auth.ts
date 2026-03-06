#!/usr/bin/env bun
// scripts/verify-auth.ts - Verify Better Auth Configuration

import 'dotenv/config';

console.log('🔍 Verifying Better Auth Configuration\n');

const checks = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  APP_URL: process.env.APP_URL,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✓ Set' : '✗ Missing',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing'
};

console.log('Environment Variables:');
for (const [key, value] of Object.entries(checks)) {
  console.log(`  ${key}: ${value}`);
}

console.log('\n📋 Required Google OAuth Redirect URIs:');
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
console.log(`  ${baseUrl}/api/auth/callback/google`);
console.log(`  ${baseUrl}/api/auth/sign-in/social`);

console.log('\n✅ Add these URIs to your Google Cloud Console:');
console.log('   https://console.cloud.google.com/apis/credentials');
console.log('\n💡 Make sure to restart your dev server after changing .env');
