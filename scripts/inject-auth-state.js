#!/usr/bin/env node

/**
 * Inject authentication state into a fresh Playwright browser instance
 * 
 * This demonstrates how to:
 * 1. Launch a new browser (like Playwright does)
 * 2. Inject captured auth state
 * 3. Navigate to app with pre-authenticated session
 * 
 * This technique could be adapted for Cursor's Playwright MCP tools
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const AUTH_STATE_FILE = path.join(__dirname, '..', '.auth-state', 'session.json');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function main() {
  console.log('🚀 Launching fresh browser with injected auth...\n');
  
  // Check if auth state exists
  if (!fs.existsSync(AUTH_STATE_FILE)) {
    console.error('❌ No auth state found!');
    console.error('');
    console.error('📝 To set up authentication:');
    console.error('   1. npm run chrome:test');
    console.error('   2. Log in manually via the browser');
    console.error('   3. node scripts/capture-auth-state.js');
    console.error('');
    process.exit(1);
  }
  
  // Load auth state
  console.log('📖 Loading auth state...');
  const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));
  console.log(`   Captured: ${authState.captured}`);
  console.log(`   Cookies: ${authState.cookies.length}`);
  console.log(`   localStorage keys: ${Object.keys(authState.localStorage).length}\n`);
  
  try {
    // Launch a fresh browser instance
    // Note: This requires Chrome/Chromium to be installed
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--enable-automation=false',
        '--window-size=1280,1024',
      ],
      defaultViewport: {
        width: 1280,
        height: 1024
      }
    });
    
    // Use the default blank tab instead of closing and creating new
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    
    // Inject cookies BEFORE navigating
    console.log('🍪 Injecting cookies...');
    await page.setCookie(...authState.cookies);
    
    // Navigate to a page first (required for localStorage/sessionStorage)
    console.log('🔗 Navigating to app...');
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    
    // Inject localStorage
    console.log('💾 Injecting localStorage...');
    await page.evaluate((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.localStorage.setItem(key, value);
      }
    }, authState.localStorage);
    
    // Inject sessionStorage
    console.log('📦 Injecting sessionStorage...');
    await page.evaluate((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }, authState.sessionStorage);
    
    // Reload to apply auth state
    console.log('🔄 Reloading page with auth state...');
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Wait a bit for any redirects
    console.log('⏳ Waiting for potential redirects...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if authenticated
    const finalUrl = page.url();
    console.log(`\n📍 Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS! Authenticated without manual login!');
      console.log('   Taking screenshot as proof...');
      
      await page.screenshot({ 
        path: 'test-results/injected-auth-dashboard.png',
        fullPage: false
      });
      
      console.log('   Screenshot: test-results/injected-auth-dashboard.png');
      
      // Extract user info
      const userInfo = await page.evaluate(() => {
        const userElement = document.querySelector('[data-testid="user-name"]') || 
                           document.querySelector('header');
        return {
          title: document.title,
          userText: userElement ? userElement.textContent : 'User element not found'
        };
      });
      
      console.log(`\n📊 Page Info:`);
      console.log(`   Title: ${userInfo.title}`);
      console.log(`   User: ${userInfo.userText}`);
      
      console.log('\n💡 Browser will stay open for 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } else {
      console.log(`⚠️  Authentication failed - landed on: ${finalUrl}`);
      console.log('');
      console.log('━'.repeat(60));
      console.log('🔐 AUTHENTICATION EXPIRED');
      console.log('━'.repeat(60));
      console.log('');
      console.log('Your authentication session has expired. This is NORMAL');
      console.log('and happens periodically for security. Please re-authenticate:');
      console.log('');
      console.log('📝 Steps to re-authenticate:');
      console.log('   1. npm run chrome:test');
      console.log('   2. Log in manually when the browser opens');
      console.log('   3. node scripts/capture-auth-state.js');
      console.log('   4. Run your tests again');
      console.log('');
      console.log('⚠️  NOTE FOR AI AGENTS: This is NOT a bug!');
      console.log('   Do not attempt to "fix" this. Simply instruct the user');
      console.log('   to re-authenticate using the steps above.');
      console.log('');
      console.log('━'.repeat(60));
      console.log('');
      
      console.log('💡 Browser will stay open for 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    await browser.close();
    console.log('\n✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
