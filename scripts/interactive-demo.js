#!/usr/bin/env node

/**
 * Interactive demo - shows visible page interactions
 */

const puppeteer = require('puppeteer-core');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔌 Connecting to Chrome...');
  
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
    await appPage.bringToFront();
    await sleep(500);
    
    // Demo 1: Scroll down slowly
    console.log('📜 Scrolling down...');
    await appPage.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(1500);
    
    console.log('📜 Scrolling back up...');
    await appPage.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    await sleep(1500);
    
    // Demo 2: Try to click the "Upcoming" filter dropdown
    console.log('🔽 Looking for clickable elements...');
    const dropdownClicked = await appPage.evaluate(() => {
      // Try to find the Important dropdown button
      const buttons = Array.from(document.querySelectorAll('button'));
      const dropdown = buttons.find(btn => btn.textContent.includes('Important'));
      if (dropdown) {
        dropdown.click();
        return true;
      }
      return false;
    });
    
    if (dropdownClicked) {
      console.log('✅ Clicked dropdown');
      await sleep(2000);
      
      // Close it
      console.log('⬆️ Closing dropdown...');
      await appPage.keyboard.press('Escape');
      await sleep(1000);
    }
    
    // Demo 3: Try to hover over navigation items
    console.log('🖱️ Hovering over navigation...');
    const navItems = await appPage.$$('nav a, header a[href*="courses"], header a[href*="announcements"]');
    
    if (navItems.length > 0) {
      for (let i = 0; i < Math.min(3, navItems.length); i++) {
        await navItems[i].hover();
        await sleep(500);
      }
      console.log(`✅ Hovered over ${Math.min(3, navItems.length)} nav items`);
    }
    
    console.log('✅ Demo complete!');
    console.log('👀 You should have seen: scrolling, dropdown click, and nav hover effects');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
