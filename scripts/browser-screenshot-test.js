// Launch browser, verify auth, take screenshot, close
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function takeScreenshot() {
  console.log('🚀 Launching browser...');
  
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  console.log('🔗 Navigating to:', APP_URL);
  await page.goto(APP_URL);
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ 
    path: 'test-results/browser-test.png',
    fullPage: true 
  });
  
  // Check if we're authenticated (on dashboard)
  const url = page.url();
  console.log('📍 Current URL:', url);
  
  // If on landing page, check for login button
  if (url === APP_URL || url === `${APP_URL}/`) {
    const hasLoginButton = await page.locator('[data-testid="real-login-button"]').count();
    console.log('🔐 Auth status: Not logged in (landing page)');
    console.log('👉 Login button present:', hasLoginButton > 0);
  } else if (url.includes('/dashboard')) {
    console.log('✅ Auth status: AUTHENTICATED (on dashboard)');
    
    // Get user name if visible
    try {
      const welcomeText = await page.locator('h1').first().textContent({timeout: 1000});
      console.log('👤 Welcome message:', welcomeText);
    } catch {}
  }
  
  console.log('');
  console.log('🚪 Closing browser...');
  await context.close();
  
  console.log('✅ Screenshot saved to: test-results/browser-test.png');
  console.log('✅ Session persisted for future use!');
}

takeScreenshot().catch(console.error);

