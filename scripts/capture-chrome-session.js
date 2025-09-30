#!/usr/bin/env node

/**
 * Capture Auth State from Your Existing Chrome Window
 * 
 * This script connects to your already-open Chrome browser
 * and captures the authenticated session state.
 * 
 * Usage:
 *   1. Open Chrome manually and sign in to the app
 *   2. Run: node scripts/capture-chrome-session.js
 *   3. Script extracts cookies and saves to .auth/state.json
 * 
 * Prerequisites:
 *   Chrome must be started with: --remote-debugging-port=9222
 *   Or run: bash scripts/start-chrome-debug.sh
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const AUTH_STATE_PATH = path.join(__dirname, '..', '.auth', 'state.json');
const CDP_URL = 'http://localhost:9222';

async function captureSession() {
  console.log('\n' + '='.repeat(80));
  console.log('📸 CAPTURE CHROME SESSION');
  console.log('='.repeat(80));
  console.log('\nConnecting to your Chrome browser via DevTools Protocol...\n');

  try {
    // Connect to existing Chrome instance
    const browser = await chromium.connectOverCDP(CDP_URL);
    
    console.log('✅ Connected to Chrome!\n');
    
    // Get all contexts (tabs)
    const contexts = browser.contexts();
    
    if (contexts.length === 0) {
      throw new Error('No browser contexts found. Make sure Chrome is running.');
    }
    
    // Use the first context (or find one with our app)
    const context = contexts[0];
    const pages = context.pages();
    
    console.log(`📄 Found ${pages.length} open tab(s)`);
    
    // Find the page with our app
    let appPage = null;
    for (const page of pages) {
      const url = page.url();
      if (url.includes('modernteaching.ngrok.dev')) {
        appPage = page;
        console.log(`✅ Found app tab: ${url}\n`);
        break;
      }
    }
    
    if (!appPage) {
      console.log('⚠️  No tab with modernteaching.ngrok.dev found');
      console.log('ℹ️  Will use the first tab and check auth status\n');
      appPage = pages[0];
    }
    
    // Check if authenticated
    try {
      const authResponse = await appPage.request.get('https://modernteaching.ngrok.dev/api/auth/status');
      
      if (authResponse.status() === 200) {
        const userData = await authResponse.json();
        console.log('✅ Authenticated as:', userData.name || userData.id || 'User');
        console.log('');
      } else if (authResponse.status() === 404 || authResponse.status() === 401) {
        console.log('⚠️  Not authenticated yet!');
        console.log('👉 Please sign in to https://modernteaching.ngrok.dev in your Chrome window');
        console.log('   Then run this script again.\n');
        await browser.close();
        return;
      }
    } catch (error) {
      console.log('⚠️  Could not verify auth status:', error.message);
    }
    
    // Ensure .auth directory exists
    const authDir = path.join(__dirname, '..', '.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    // Save the storage state
    await context.storageState({ path: AUTH_STATE_PATH });
    
    console.log('='.repeat(80));
    console.log('🎉 SUCCESS! Saved authenticated session');
    console.log('='.repeat(80));
    console.log(`\n💾 Saved to: ${AUTH_STATE_PATH}\n`);
    console.log('Now you can run automated tests that will:');
    console.log('  ✅ Load this saved session');
    console.log('  ✅ Be already authenticated');
    console.log('  ✅ Skip hCaptcha and OAuth');
    console.log('  ✅ Test as a logged-in user\n');
    
    await browser.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPossible causes:');
    console.error('  - Chrome not running with --remote-debugging-port=9222');
    console.error('  - Run: bash scripts/start-chrome-debug.sh');
    console.error('  - Then run this script again\n');
  }
}

captureSession().catch(console.error);

