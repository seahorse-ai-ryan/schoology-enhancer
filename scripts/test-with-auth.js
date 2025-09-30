#!/usr/bin/env node

/**
 * Test Automated Browser with Saved Auth State
 * 
 * This script demonstrates using the saved auth state
 * for fully automated testing (no manual login required!)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const AUTH_STATE_PATH = path.join(__dirname, '..', '.auth', 'state.json');
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://modernteaching.ngrok.dev';

async function testWithAuth() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 AUTOMATED TESTING WITH SAVED AUTH');
  console.log('='.repeat(80) + '\n');

  // Check if auth state exists
  if (!fs.existsSync(AUTH_STATE_PATH)) {
    console.log('❌ No saved auth state found at:', AUTH_STATE_PATH);
    console.log('\n👉 First run: node scripts/capture-chrome-session.js\n');
    return;
  }

  console.log('✅ Found saved auth state\n');

  // Launch browser with saved auth
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
  });

  const context = await browser.newContext({
    storageState: AUTH_STATE_PATH, // Load saved session
  });

  const page = await context.newPage();

  console.log(`📱 Navigating to dashboard (using saved auth)...`);
  await page.goto(`${APP_URL}/dashboard`);

  // Wait a moment for page to load
  await page.waitForTimeout(2000);

  // Check auth status
  console.log('🔍 Checking authentication...\n');
  const authResponse = await page.request.get('/api/auth/status');
  
  if (authResponse.status() === 200) {
    const userData = await authResponse.json();
    console.log('✅ Authenticated as:', userData.name || userData.id);
    console.log('✅ You are logged in automatically!\n');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/authenticated-dashboard.png' });
    console.log('📸 Screenshot saved: test-results/authenticated-dashboard.png\n');
    
    console.log('='.repeat(80));
    console.log('🎉 SUCCESS! Automated testing with saved auth works!');
    console.log('='.repeat(80));
    console.log('\nThis means:');
    console.log('  ✅ No manual login needed');
    console.log('  ✅ No hCaptcha challenges');
    console.log('  ✅ Fully automated E2E tests possible');
    console.log('  ✅ All Cursor MCP browser tests can use this state\n');
    
  } else {
    console.log('❌ Auth failed - status:', authResponse.status());
    console.log('👉 Session may have expired. Re-run: node scripts/capture-chrome-session.js\n');
  }

  console.log('Closing browser in 3 seconds...');
  await page.waitForTimeout(3000);
  await browser.close();
}

testWithAuth().catch(console.error);
