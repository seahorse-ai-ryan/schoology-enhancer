#!/usr/bin/env node

/**
 * ⚠️  DESTRUCTIVE TEST: Logout Functionality
 * 
 * WARNING: This test logs out the current user, invalidating all captured
 * authentication state. After running this test, you MUST re-authenticate
 * before running any other automated tests.
 * 
 * DO NOT run this as part of regular test suites!
 * Only run manually when specifically testing logout functionality.
 * 
 * Usage: node scripts/test-logout.js
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const AUTH_STATE_FILE = path.join(__dirname, '..', '.auth-state', 'session.json');

async function testLogout() {
  console.log('━'.repeat(60));
  console.log('⚠️  DESTRUCTIVE TEST: LOGOUT');
  console.log('━'.repeat(60));
  console.log('');
  console.log('This test will log out the current user and invalidate');
  console.log('all captured authentication. You will need to re-authenticate');
  console.log('after this test completes.');
  console.log('');
  console.log('Waiting 5 seconds... Press Ctrl+C to cancel.');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  if (!fs.existsSync(AUTH_STATE_FILE)) {
    console.log('❌ No auth state found - nothing to test');
    process.exit(1);
  }
  
  const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));
  
  let browser;
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
      ]
    });
    
    const page = await browser.newPage();
    
    // Inject auth and navigate to dashboard
    console.log('🔐 Injecting authentication...');
    await page.setCookie(...authState.cookies);
    await page.goto('https://modernteaching.ngrok.dev/dashboard', { 
      waitUntil: 'networkidle2' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const urlBeforeLogout = page.url();
    console.log(`✅ Authenticated to: ${urlBeforeLogout}`);
    
    if (!urlBeforeLogout.includes('/dashboard')) {
      console.log('⚠️  Not authenticated - test cannot proceed');
      await browser.close();
      process.exit(1);
    }
    
    // Test logout
    console.log('🚪 Testing logout...');
    
    // Call logout API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      return {
        status: res.status,
        ok: res.ok
      };
    });
    
    console.log(`   Logout API response: ${response.status} ${response.ok ? 'OK' : 'FAILED'}`);
    
    if (response.ok) {
      console.log('✅ Logout API call successful');
    } else {
      console.log('❌ Logout API call failed');
      await browser.close();
      process.exit(1);
    }
    
    // Verify redirect to home
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to access dashboard again - should redirect to login
    console.log('🔍 Verifying session cleared...');
    await page.goto('https://modernteaching.ngrok.dev/dashboard', { 
      waitUntil: 'networkidle2' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const urlAfterLogout = page.url();
    console.log(`   Landed on: ${urlAfterLogout}`);
    
    if (urlAfterLogout.includes('/dashboard')) {
      console.log('❌ Still on dashboard - logout may have failed');
      await browser.close();
      process.exit(1);
    } else {
      console.log('✅ Redirected away from dashboard - logout successful!');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/logout-test.png' });
    console.log('📸 Screenshot: test-results/logout-test.png');
    
    console.log('');
    console.log('━'.repeat(60));
    console.log('✅ LOGOUT TEST PASSED');
    console.log('━'.repeat(60));
    console.log('');
    console.log('⚠️  Your authentication is now invalid!');
    console.log('');
    console.log('📝 To re-authenticate for further testing:');
    console.log('   1. npm run chrome:test');
    console.log('   2. Log in manually');
    console.log('   3. node scripts/capture-auth-state.js');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
    
    // Delete captured auth state to prevent confusion
    console.log('🗑️  Deleting invalid auth state file...');
    fs.unlinkSync(AUTH_STATE_FILE);
    console.log('✅ Auth state file deleted\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testLogout();
