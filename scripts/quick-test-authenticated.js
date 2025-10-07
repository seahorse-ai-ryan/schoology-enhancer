#!/usr/bin/env node

/**
 * Quick test of authenticated session - no interactive mode
 */

const puppeteer = require('puppeteer-core');

async function main() {
  console.log('🔌 Connecting to Chrome at port 9222...');
  
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    console.log('✅ Connected!');
    
    const pages = await browser.pages();
    let appPage = pages.find(page => page.url().includes('modernteaching.ngrok.dev'));
    
    if (!appPage) {
      console.log('❌ No app tab found');
      process.exit(1);
    }
    
    console.log(`✅ Found app tab: ${appPage.url()}`);
    await appPage.bringToFront();
    
    // Take screenshot
    const screenshotPath = `test-results/quick-test-${Date.now()}.png`;
    await appPage.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Screenshot: ${screenshotPath}`);
    
    // Get some data from the page
    const pageData = await appPage.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasUserAvatar: !!document.querySelector('[data-testid="user-avatar"], .avatar, img[alt*="avatar"]'),
        dashboardElements: document.querySelectorAll('[class*="card"], [class*="Card"]').length
      };
    });
    
    console.log('📊 Page Data:', JSON.stringify(pageData, null, 2));
    console.log('✅ Test complete!');
    
    // Don't close browser - it's the user's!
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Make sure Chrome is running: npm run chrome:test');
    process.exit(1);
  }
}

main();
