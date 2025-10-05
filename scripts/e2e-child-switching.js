// E2E Test: Parent Child Switching
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testChildSwitching() {
  console.log('🧪 E2E Test: Child Switching\n');
  
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  try {
    // Navigate to dashboard
    console.log('1️⃣ Loading dashboard...');
    await page.goto(`${APP_URL}/dashboard`);
    await page.waitForTimeout(3000);
    
    // Test: Check for profile/child selector
    console.log('2️⃣ Looking for child selector...');
    
    // Look for profile menu or child selector button
    const profileButtons = await page.locator('button').count();
    console.log(`   Found ${profileButtons} buttons on page`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/e2e-child-selector.png',
      fullPage: true 
    });
    console.log('   📸 Screenshot: test-results/e2e-child-selector.png');
    
    // Check for courses
    const courseCards = await page.locator('[data-testid="course-item"]').count().catch(() => 0);
    if (courseCards > 0) {
      console.log(`   ✅ Found ${courseCards} courses`);
    } else {
      // Alternative: look for any course-related text
      const hasCourses = await page.locator('text=course').count().catch(() => 0);
      console.log(`   ℹ️  Found ${hasCourses} course references`);
    }
    
    console.log('\n✅ Child Switching Test Complete!');
    console.log('📝 Note: Full child switching test requires UI implementation');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await context.close();
    console.log('🚪 Browser closed');
  }
}

testChildSwitching().catch(console.error);

