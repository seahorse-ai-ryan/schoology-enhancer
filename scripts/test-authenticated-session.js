#!/usr/bin/env node

/**
 * Connect to running Chrome instance and test authenticated session
 * 
 * This script:
 * 1. Connects to Chrome via CDP (port 9222)
 * 2. Finds or creates a tab with your app
 * 3. Performs automated interactions without affecting other tabs
 */

const puppeteer = require('puppeteer-core');
const readline = require('readline');

const CHROME_DEBUG_PORT = 9222;
const APP_URL = 'https://modernteaching.ngrok.dev';

async function main() {
  console.log('🔌 Connecting to existing Chrome instance...');
  
  try {
    // Connect to the existing Chrome instance
    const browser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${CHROME_DEBUG_PORT}`,
      defaultViewport: null
    });
    
    console.log('✅ Connected to Chrome!');
    
    // Get all pages/tabs
    const pages = await browser.pages();
    console.log(`📑 Found ${pages.length} open tabs`);
    
    // Find a tab with your app or create a new one
    let appPage = pages.find(page => page.url().includes('modernteaching.ngrok.dev'));
    
    if (appPage) {
      console.log(`✅ Found existing app tab: ${appPage.url()}`);
      await appPage.bringToFront();
    } else {
      console.log('📝 Creating new tab for the app...');
      appPage = await browser.newPage();
      await appPage.goto(APP_URL, { waitUntil: 'networkidle2' });
      console.log('✅ Navigated to app');
    }
    
    // Check if authenticated
    console.log('\n🔍 Checking authentication status...');
    const currentUrl = appPage.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ User is authenticated and on dashboard!');
      
      // Take a screenshot
      const screenshotPath = 'test-results/authenticated-dashboard-persistent.png';
      await appPage.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Get page title
      const title = await appPage.title();
      console.log(`📄 Page title: ${title}`);
      
      // Example: Get user info from the page
      const userName = await appPage.evaluate(() => {
        // Look for user name in the UI - adjust selector as needed
        const userElement = document.querySelector('[data-testid="user-name"]') || 
                           document.querySelector('.user-name') ||
                           document.querySelector('h1');
        return userElement ? userElement.textContent : 'Unknown';
      });
      console.log(`👤 User: ${userName}`);
      
    } else {
      console.log('⚠️  Not authenticated yet or not on dashboard');
      console.log('Please log in manually in the browser, then run this script again.');
    }
    
    // Keep connection open for interactive testing
    console.log('\n💡 Browser connection active. Type commands or "exit" to quit:');
    console.log('   - screenshot: Take a screenshot');
    console.log('   - url: Show current URL');
    console.log('   - title: Show page title');
    console.log('   - navigate <url>: Navigate to a URL');
    console.log('   - exit: Close connection\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('line', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      try {
        switch (command) {
          case 'screenshot':
            const path = `test-results/screenshot-${Date.now()}.png`;
            await appPage.screenshot({ path, fullPage: true });
            console.log(`📸 Screenshot saved: ${path}`);
            break;
            
          case 'url':
            console.log(`Current URL: ${appPage.url()}`);
            break;
            
          case 'title':
            const pageTitle = await appPage.title();
            console.log(`Page title: ${pageTitle}`);
            break;
            
          case 'navigate':
            if (args.length === 0) {
              console.log('❌ Please provide a URL');
            } else {
              const targetUrl = args[0];
              console.log(`🚀 Navigating to: ${targetUrl}`);
              await appPage.goto(targetUrl, { waitUntil: 'networkidle2' });
              console.log('✅ Navigation complete');
            }
            break;
            
          case 'exit':
            console.log('👋 Closing connection...');
            rl.close();
            // Don't close browser - it's the user's browser!
            process.exit(0);
            break;
            
          default:
            console.log(`❌ Unknown command: ${command}`);
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
      
      rl.prompt();
    });
    
    rl.setPrompt('> ');
    rl.prompt();
    
  } catch (error) {
    console.error('❌ Failed to connect to Chrome:', error.message);
    console.error('\nMake sure Chrome is running with: npm run chrome:test');
    process.exit(1);
  }
}

main();
