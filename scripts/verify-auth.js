// Verify authentication is working and close browser
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function verifyAuth() {
  console.log('🔍 Verifying authentication status...');
  
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto(`${APP_URL}/dashboard`);
  
  // Wait for dashboard to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/auth-verification.png',
    fullPage: true 
  });
  
  // Check if authenticated
  const url = page.url();
  const isOnDashboard = url.includes('/dashboard');
  
  console.log('');
  console.log('📸 Screenshot saved: test-results/auth-verification.png');
  console.log('🔗 Current URL:', url);
  console.log('✅ Authentication:', isOnDashboard ? 'VERIFIED' : 'FAILED');
  console.log('');
  
  // Close browser
  await context.close();
  console.log('🚪 Browser closed.');
  console.log('✅ Session persisted for future use!');
}

verifyAuth().catch(console.error);

