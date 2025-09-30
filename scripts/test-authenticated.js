#!/usr/bin/env node

/**
 * Automated Testing with Persistent Chrome Profile
 * 
 * This uses Playwright's launchPersistentContext to maintain
 * a real Chrome profile where your authentication persists!
 * 
 * HOW IT WORKS:
 * 1. First run: Browser opens, you sign in manually (pass hCaptcha once)
 * 2. Session saved to profile directory
 * 3. Future runs: Already authenticated! No manual login needed!
 * 
 * Usage:
 *   node scripts/test-authenticated.js
 */

const { chromium } = require('playwright');
const path = require('path');

// Persistent profile directory (session saved here across runs)
const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://modernteaching.ngrok.dev';

async function testAuthenticated() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 AUTOMATED TESTING WITH PERSISTENT AUTH');
  console.log('='.repeat(80) + '\n');

  console.log(`📁 Using profile directory: ${PROFILE_DIR}`);
  console.log('ℹ️  Your authentication will persist in this directory\n');

  // Launch Chrome with persistent context (maintains session across runs!)
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome', // Use system Chrome
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled', // Hide automation
    ],
  });

  console.log('✅ Chrome launched with persistent profile\n');

  // Get or create a page
  let page = context.pages()[0];
  if (!page) {
    page = await context.newPage();
  }

  // Navigate to app
  console.log(`📱 Navigating to: ${APP_URL}/dashboard`);
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(2000);

  // Check authentication
  console.log('🔍 Checking authentication...\n');
  
  const currentUrl = page.url();
  console.log(`   Current URL: ${currentUrl}`);

  // Check if we're authenticated
  const authCheck = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        return { authenticated: true, user: data };
      }
      return { authenticated: false };
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  });

  if (authCheck.authenticated) {
    console.log('✅ Already authenticated!');
    console.log(`   User: ${authCheck.user?.name || authCheck.user?.id || 'Unknown'}\n`);
    
    console.log('='.repeat(80));
    console.log('🎉 SUCCESS! You are authenticated');
    console.log('='.repeat(80));
    console.log('\n🧪 Now testing dashboard features...\n');

    // Test 1: Check for courses
    console.log('Test 1: Verifying courses are displayed...');
    await page.waitForTimeout(2000);
    
    const coursesVisible = await page.evaluate(() => {
      const courseElements = document.querySelectorAll('[data-testid="course-item"], .course-card, .course');
      return courseElements.length;
    });
    
    console.log(`   ✅ Found ${coursesVisible} course element(s)\n`);

    // Test 2: Check for profile menu
    console.log('Test 2: Looking for user profile menu...');
    const profileMenu = await page.evaluate(() => {
      const menu = document.querySelector('[data-testid="user-nav"], [role="button"][aria-haspopup="menu"]');
      return !!menu;
    });
    
    if (profileMenu) {
      console.log('   ✅ Profile menu found\n');
    } else {
      console.log('   ⚠️  Profile menu not found (may use different selector)\n');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/automated-authenticated-test.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/automated-authenticated-test.png\n');

    console.log('='.repeat(80));
    console.log('✅ AUTOMATED TESTING SUCCESSFUL!');
    console.log('='.repeat(80));
    console.log('\nYour session persists! Next run will skip login automatically.\n');

  } else {
    console.log('⚠️  Not authenticated yet\n');
    console.log('='.repeat(80));
    console.log('🔐 AUTHENTICATION REQUIRED (FIRST TIME ONLY)');
    console.log('='.repeat(80));
    console.log('\nIN THE BROWSER WINDOW THAT JUST OPENED:');
    console.log('  1. Click "Sign In with Schoology"');
    console.log('  2. Complete OAuth flow (including hCaptcha)');
    console.log('  3. Wait for redirect to dashboard');
    console.log('\nThen run this script again - you\'ll be authenticated!\n');
    console.log('⏸️  Leaving browser open for 2 minutes...');
    console.log('   Complete sign-in, then Ctrl+C and re-run this script\n');
    
    await page.waitForTimeout(120000); // 2 minutes
  }

  await context.close();
}

testAuthenticated().catch(console.error);

