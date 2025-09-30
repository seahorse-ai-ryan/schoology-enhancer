#!/usr/bin/env node

/**
 * Save Authenticated Browser State
 * 
 * This script opens a browser for manual OAuth login,
 * then saves the authenticated session for future automated tests.
 * 
 * Usage:
 *   node scripts/save-auth-state.js
 * 
 * What it does:
 *   1. Opens browser to your app
 *   2. You manually sign in with Schoology (pass hCaptcha once)
 *   3. After redirect, saves auth state to .auth/state.json
 *   4. Future tests load this state (no more hCaptcha!)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const AUTH_STATE_PATH = path.join(__dirname, '..', '.auth', 'state.json');
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://modernteaching.ngrok.dev';

async function saveAuthState() {
  console.log('\n' + '='.repeat(80));
  console.log('🔐 SAVE AUTHENTICATED STATE');
  console.log('='.repeat(80));
  console.log('\nThis script will:');
  console.log('  1. Open a browser window');
  console.log('  2. Navigate to your app');
  console.log('  3. Wait for you to sign in with Schoology');
  console.log('  4. Save your authenticated session');
  console.log('  5. Close the browser');
  console.log('\nAfter this, all automated tests can reuse your session!');
  console.log('='.repeat(80) + '\n');

  // Ensure .auth directory exists
  const authDir = path.join(__dirname, '..', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('✅ Created .auth directory\n');
  }

  // Launch browser in headed mode using system Chrome (not Chromium)
  const browser = await chromium.launch({
    channel: 'chrome', // Use your installed Google Chrome
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled', // Hide automation flags
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
  });

  // Add script to mask webdriver
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  const page = await context.newPage();

  console.log(`📱 Opening browser to: ${APP_URL}`);
  console.log('⏳ Waiting for you to sign in...\n');

  await page.goto(APP_URL);

  // Wait for user to complete OAuth
  console.log('👉 Please complete these steps in the browser:');
  console.log('   1. Click "Sign In with Schoology"');
  console.log('   2. Complete OAuth (including hCaptcha if needed)');
  console.log('   3. Wait for redirect back to dashboard');
  console.log('   4. Verify you see your authenticated dashboard\n');
  console.log('⏱️  Script will auto-detect when authentication completes...\n');

  // Wait for successful auth (URL changes to dashboard or auth status becomes 200)
  try {
    await Promise.race([
      // Wait for redirect to dashboard
      page.waitForURL('**/dashboard', { timeout: 300000 }), // 5 minutes
      
      // Or wait for auth status to return 200
      page.waitForResponse(
        response => 
          response.url().includes('/api/auth/status') && 
          response.status() === 200,
        { timeout: 300000 }
      ),
    ]);

    // Give it a moment to settle
    await page.waitForTimeout(2000);

    // Verify authentication
    const authResponse = await page.request.get('/api/auth/status');
    if (authResponse.status() !== 200) {
      throw new Error('Authentication verification failed');
    }

    console.log('\n✅ Authentication detected!');

    // Save the authenticated state
    await context.storageState({ path: AUTH_STATE_PATH });

    console.log(`✅ Saved auth state to: ${AUTH_STATE_PATH}\n`);
    console.log('='.repeat(80));
    console.log('🎉 SUCCESS! Your authenticated session is saved.');
    console.log('='.repeat(80));
    console.log('\nNow you can run automated tests that will reuse this session:');
    console.log('  - No more manual login required!');
    console.log('  - No more hCaptcha challenges!');
    console.log('  - All tests will run as an authenticated user\n');
    console.log('To refresh this auth (when session expires):');
    console.log('  node scripts/save-auth-state.js\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPossible causes:');
    console.error('  - Timeout waiting for authentication');
    console.error('  - OAuth flow failed');
    console.error('  - Network issues\n');
  } finally {
    await browser.close();
  }
}

saveAuthState().catch(console.error);
