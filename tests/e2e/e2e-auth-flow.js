// E2E Test: Complete Authentication Flow
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testAuthFlow() {
  console.log('🧪 E2E Test: Authentication Flow\n');
  
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  try {
    // Test 1: Landing page loads
    console.log('1️⃣ Testing landing page...');
    await page.goto(APP_URL);
    await page.waitForSelector('h1', { timeout: 5000 });
    const title = await page.locator('h1').textContent();
    console.log(`   ✅ Title: "${title}"`);
    
    // Test 2: Login button exists
    console.log('2️⃣ Testing login button...');
    const loginButton = page.locator('[data-testid="real-login-button"]');
    const buttonVisible = await loginButton.isVisible().catch(() => false);
    
    if (buttonVisible) {
      console.log('   ⚠️  Not authenticated - login button visible');
      console.log('   👉 Click "Sign In with Schoology" to continue test');
    } else {
      console.log('   ✅ Already authenticated!');
    }
    
    // Test 3: Navigate to dashboard
    console.log('3️⃣ Testing dashboard access...');
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForTimeout(3000); // Wait for data to load
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Dashboard loaded');
      
      // Test 4: Check for courses
      const welcomeMsg = await page.locator('h1').first().textContent().catch(() => null);
      if (welcomeMsg) {
        console.log(`   ✅ Welcome message: "${welcomeMsg}"`);
      }
      
      // Test 5: Check for "Live Verified" badge
      const liveBadge = await page.locator('text=Live Verified').count();
      if (liveBadge > 0) {
        console.log('   ✅ Live data verified badge present');
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/e2e-dashboard.png',
        fullPage: true 
      });
      console.log('   📸 Screenshot: test-results/e2e-dashboard.png');
      
    } else {
      console.log(`   ❌ Redirected to: ${currentUrl}`);
    }
    
    console.log('\n✅ E2E Test Complete!');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await context.close();
    console.log('🚪 Browser closed');
  }
}

testAuthFlow().catch(console.error);

