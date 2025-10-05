// Launch persistent browser for manual testing and authentication
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function launchBrowser() {
  console.log('🌐 Launching browser with persistent authentication...');
  console.log('📁 Profile directory:', PROFILE_DIR);
  console.log('🔗 App URL:', APP_URL);
  console.log('');
  console.log('👤 Please sign in with your Schoology credentials if needed.');
  console.log('✅ Your session will be saved for future AI testing sessions!');
  console.log('');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const page = context.pages()[0] || await context.newPage();
  
  // Navigate to app
  await page.goto(APP_URL);
  
  console.log('');
  console.log('🎉 Browser launched!');
  console.log('📝 When you\'re done:');
  console.log('   - Close the browser window');
  console.log('   - Your auth session is saved');
  console.log('   - AI agents can use this session for testing');
  console.log('');
  console.log('⏳ Browser will stay open until you close it...');

  // Wait for user to close browser
  await context.waitForEvent('close');
  
  console.log('');
  console.log('✅ Browser closed. Session saved!');
}

launchBrowser().catch(console.error);

