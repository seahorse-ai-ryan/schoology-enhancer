#!/usr/bin/env node

/**
 * Capture authentication state from persistent Chrome profile
 * 
 * Extracts:
 * - Cookies
 * - localStorage
 * - sessionStorage
 * 
 * Saves to: .auth-state/session.json (gitignored)
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const AUTH_STATE_DIR = path.join(__dirname, '..', '.auth-state');
const AUTH_STATE_FILE = path.join(AUTH_STATE_DIR, 'session.json');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function main() {
  console.log('🔐 Capturing authentication state...\n');
  
  try {
    // Connect to persistent Chrome instance
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    let appPage = pages.find(page => page.url().includes('modernteaching.ngrok.dev'));
    
    if (!appPage) {
      console.log('⚠️  No app tab found. Opening one...');
      appPage = await browser.newPage();
      await appPage.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
    }
    
    const currentUrl = appPage.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check if authenticated
    if (!currentUrl.includes('/dashboard')) {
      console.error('❌ Not authenticated! Please log in first using: npm run chrome:test');
      console.error('   Then navigate to the dashboard before running this script.');
      process.exit(1);
    }
    
    console.log('✅ Authenticated session detected\n');
    
    // Extract cookies
    console.log('🍪 Extracting cookies...');
    const cookies = await appPage.cookies();
    console.log(`   Found ${cookies.length} cookies`);
    
    // Extract localStorage
    console.log('💾 Extracting localStorage...');
    const localStorage = await appPage.evaluate(() => {
      const data = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        data[key] = window.localStorage.getItem(key);
      }
      return data;
    });
    console.log(`   Found ${Object.keys(localStorage).length} localStorage items`);
    
    // Extract sessionStorage
    console.log('📦 Extracting sessionStorage...');
    const sessionStorage = await appPage.evaluate(() => {
      const data = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        data[key] = window.sessionStorage.getItem(key);
      }
      return data;
    });
    console.log(`   Found ${Object.keys(sessionStorage).length} sessionStorage items`);
    
    // Get user info for validation
    console.log('👤 Extracting user info...');
    const userInfo = await appPage.evaluate(() => {
      return {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
    });
    
    // Prepare auth state object
    const authState = {
      captured: userInfo.timestamp,
      url: userInfo.url,
      userAgent: userInfo.userAgent,
      cookies,
      localStorage,
      sessionStorage
    };
    
    // Ensure directory exists
    if (!fs.existsSync(AUTH_STATE_DIR)) {
      fs.mkdirSync(AUTH_STATE_DIR, { recursive: true });
    }
    
    // Save to file
    fs.writeFileSync(AUTH_STATE_FILE, JSON.stringify(authState, null, 2));
    
    console.log(`\n✅ Auth state saved to: ${AUTH_STATE_FILE}`);
    console.log(`   Timestamp: ${userInfo.timestamp}`);
    console.log(`   Total cookies: ${cookies.length}`);
    console.log(`   localStorage keys: ${Object.keys(localStorage).length}`);
    console.log(`   sessionStorage keys: ${Object.keys(sessionStorage).length}`);
    
    console.log('\n💡 Use this auth state with: node scripts/inject-auth-state.js');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure Chrome is running: npm run chrome:test');
    process.exit(1);
  }
}

main();
