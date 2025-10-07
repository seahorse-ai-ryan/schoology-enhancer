#!/usr/bin/env node

/**
 * Background test - interact WITHOUT bringing tab to front
 * This won't interrupt your work in other tabs/profiles
 */

const puppeteer = require('puppeteer-core');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔌 Connecting to Chrome (background mode)...');
  
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    let appPage = pages.find(page => page.url().includes('modernteaching.ngrok.dev'));
    
    if (!appPage) {
      console.log('❌ No app tab found');
      process.exit(1);
    }
    
    console.log('✅ Connected to dashboard');
    console.log('⚠️  NOT bringing tab to front - you can keep working!');
    // Removed: await appPage.bringToFront();
    
    await sleep(1000);
    
    // Can still interact with the page in the background
    console.log('📊 Reading page data in background...');
    const data = await appPage.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        scrollPosition: window.scrollY,
        visibleCards: document.querySelectorAll('[class*="card"], [class*="Card"]').length
      };
    });
    
    console.log('Data extracted:', JSON.stringify(data, null, 2));
    
    // Can even scroll in the background (you won't see it unless you're looking at that tab)
    console.log('📜 Scrolling page (in background)...');
    await appPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(500);
    
    const newScrollPos = await appPage.evaluate(() => window.scrollY);
    console.log(`✅ Scroll position changed: 0 -> ${newScrollPos}px`);
    
    // Take screenshot (works even if tab is in background)
    const screenshotPath = `test-results/background-test-${Date.now()}.png`;
    await appPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    console.log('\n✅ All operations completed WITHOUT stealing focus!');
    console.log('💡 You should NOT have been interrupted (unless you were looking at that tab)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
