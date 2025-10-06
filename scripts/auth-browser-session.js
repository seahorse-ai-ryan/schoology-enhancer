const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function launchAuthSession() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔐 LAUNCHING AUTHENTICATION BROWSER');
  console.log('═'.repeat(60));
  console.log('\n📱 Opening browser to:', APP_URL);
  console.log('📁 Persistent profile:', PROFILE_DIR);
  console.log('\n📋 INSTRUCTIONS:');
  console.log('  1. Click "Sign In with Schoology" button');
  console.log('  2. Complete OAuth authentication');
  console.log('  3. You will be redirected to the dashboard');
  console.log('  4. AI will detect completion and close browser automatically');
  console.log('\n' + '═'.repeat(60) + '\n');
  
  // Launch with persistent context and anti-detection flags
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(APP_URL);
  
  console.log('⏳ Waiting for authentication...');
  console.log('   (Browser will close automatically after you reach the dashboard)\n');
  
  // Wait for dashboard URL (indicates successful auth)
  await page.waitForURL('**/dashboard', { timeout: 300000 }); // 5 min timeout
  
  console.log('\n✅ Authentication detected!');
  console.log('📸 Taking screenshot of authenticated dashboard...\n');
  
  // Wait for dashboard to fully load
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'test-results/authenticated-dashboard.png',
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved: test-results/authenticated-dashboard.png');
  console.log('💾 Session persisted for future tests');
  console.log('\n🚪 Closing browser...\n');
  
  await context.close();
  
  console.log('═'.repeat(60));
  console.log('✅ AUTHENTICATION SESSION COMPLETE');
  console.log('═'.repeat(60) + '\n');
}

launchAuthSession().catch(console.error);
