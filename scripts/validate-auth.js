#!/usr/bin/env node

/**
 * Validate authentication state
 * 
 * Checks if captured auth is still valid by attempting to access the dashboard.
 * Returns clear guidance if re-authentication is needed.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const AUTH_STATE_FILE = path.join(__dirname, '..', '.auth-state', 'session.json');

async function validateAuth() {
  console.log('🔍 Validating authentication state...\n');
  
  // Check if auth state exists
  if (!fs.existsSync(AUTH_STATE_FILE)) {
    console.log('❌ No authentication state found\n');
    console.log('📝 To set up authentication:\n');
    console.log('   1. npm run chrome:test');
    console.log('   2. Log in manually via the browser');
    console.log('   3. node scripts/capture-auth-state.js\n');
    process.exit(1);
  }
  
  const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));
  console.log(`✅ Auth state file found (captured: ${authState.captured})`);
  
  let browser;
  try {
    // Launch browser and test auth
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
      ]
    });
    
    const page = await browser.newPage();
    
    // Inject auth
    await page.setCookie(...authState.cookies);
    await page.goto('https://modernteaching.ngrok.dev', { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalUrl = page.url();
    
    if (finalUrl.includes('/dashboard')) {
      console.log(`✅ Authentication valid - redirected to: ${finalUrl}`);
      console.log('✅ Auth check passed!\n');
      
      await browser.close();
      process.exit(0);
    } else {
      // Auth failed - user needs to re-authenticate
      console.log(`⚠️  Authentication expired - landed on: ${finalUrl}`);
      console.log('');
      console.log('━'.repeat(60));
      console.log('🔐 AUTHENTICATION REQUIRED');
      console.log('━'.repeat(60));
      console.log('');
      console.log('Your authentication session has expired. This is normal and');
      console.log('happens periodically. Please re-authenticate:');
      console.log('');
      console.log('📝 Steps to re-authenticate:');
      console.log('   1. npm run chrome:test');
      console.log('   2. Log in manually when the browser opens');
      console.log('   3. node scripts/capture-auth-state.js');
      console.log('   4. Run your tests again');
      console.log('');
      console.log('⚠️  NOTE: This is NOT a bug in your code or tests!');
      console.log('   OAuth sessions expire periodically for security.');
      console.log('');
      console.log('━'.repeat(60));
      console.log('');
      
      await browser.close();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

validateAuth();
