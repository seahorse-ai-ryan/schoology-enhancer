#!/usr/bin/env node

/**
 * Connect to Your Already-Running Chrome
 * 
 * This script connects to Chrome you started with remote debugging
 * and can control it for automated testing while maintaining your session.
 * 
 * Prerequisites:
 *   1. Start Chrome with: bash scripts/start-chrome-debug.sh
 *   2. Sign in to the app manually in that Chrome window
 *   3. Run this script to automate testing
 */

const { chromium } = require('playwright');

async function connectAndTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🔌 CONNECTING TO YOUR CHROME BROWSER');
  console.log('='.repeat(80) + '\n');

  try {
    // Connect to the Chrome instance running on port 9222
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Connected to Chrome!\n');

    // Get the default context (your already-open browser)
    const contexts = browser.contexts();
    console.log(`📱 Found ${contexts.length} browser context(s)`);

    if (contexts.length === 0) {
      throw new Error('No contexts found');
    }

    const context = contexts[0];
    const pages = context.pages();
    console.log(`📄 Found ${pages.length} open tab(s)\n`);

    // Find or create a tab with our app
    let appPage = null;
    for (const page of pages) {
      if (page.url().includes('modernteaching.ngrok.dev')) {
        appPage = page;
        console.log(`✅ Found app tab: ${page.url()}`);
        break;
      }
    }

    if (!appPage && pages.length > 0) {
      // Use first page and navigate it
      appPage = pages[0];
      console.log(`📱 Navigating to dashboard...`);
      await appPage.goto('https://modernteaching.ngrok.dev/dashboard');
    } else if (!appPage) {
      // Create new page
      appPage = await context.newPage();
      console.log(`📱 Creating new tab and navigating...`);
      await appPage.goto('https://modernteaching.ngrok.dev/dashboard');
    }

    await appPage.waitForTimeout(2000);

    // Check auth status
    console.log('\n🔍 Checking authentication...');
    const currentUrl = appPage.url();
    console.log(`   Current URL: ${currentUrl}`);

    try {
      const authResponse = await appPage.evaluate(async () => {
        const response = await fetch('/api/auth/status');
        return {
          status: response.status,
          data: response.ok ? await response.json() : null
        };
      });

      if (authResponse.status === 200) {
        console.log(`✅ Authenticated as: ${authResponse.data?.name || authResponse.data?.id || 'User'}\n`);
        
        console.log('='.repeat(80));
        console.log('🎉 SUCCESS! Your Chrome session is authenticated');
        console.log('='.repeat(80));
        console.log('\nNow you can automate testing by asking AI:');
        console.log('  "Connect to my Chrome on port 9222 and test the dashboard"');
        console.log('  "Verify parent-child switching works"');
        console.log('  "Check that courses load correctly"\n');
        console.log('The AI will control your already-authenticated Chrome!');
        console.log('No hCaptcha, no manual login needed!\n');
        
      } else {
        console.log(`⚠️  Not authenticated (status: ${authResponse.status})`);
        console.log('\n👉 Please sign in using the Chrome window on port 9222');
        console.log('   Then run this script again.\n');
      }
    } catch (error) {
      console.log('⚠️  Could not check auth:', error.message);
    }

    // Don't close browser - leave it running for testing
    await browser.disconnect();
    console.log('✅ Disconnected (Chrome still running)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPossible causes:');
    console.error('  - Chrome not running with --remote-debugging-port=9222');
    console.error('  - Run: bash scripts/start-chrome-debug.sh\n');
  }
}

connectAndTest().catch(console.error);
