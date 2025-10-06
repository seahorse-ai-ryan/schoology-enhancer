const { chromium } = require('playwright');
const path = require('path');

const STORAGE_STATE_PATH = path.join(__dirname, '..', '.auth', 'storageState.json');
const APP_URL = 'https://modernteaching.ngrok.dev/dashboard';
const SCREENSHOT_PATH = path.join(__dirname, '..', 'test-results', 'child-dashboard-screenshot.png');

async function testChildSwitching() {
  console.log('🚀 Launching browser to test child switching...');
  
  const browser = await chromium.launch({ headless: false }); // Must be headed for clicks to work reliably
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to the parent dashboard...');
    await page.goto(APP_URL, { timeout: 30000 });
    await page.waitForTimeout(3000); // Allow time for components to hydrate

    console.log('Clicking user avatar to open profile menu...');
    await page.click('[data-testid="user-avatar-trigger"]');
    await page.waitForTimeout(1000); // Allow menu to animate open

    console.log('Clicking on a student to switch view...');
    // We'll click the first available student in the "Switch Student" group.
    // This is more robust than relying on a specific name.
    await page.locator('text=Switch Student').locator('xpath=following-sibling::div[1]').click();
    
    console.log('Waiting for page to reload with child data...');
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForTimeout(5000); // Allow extra time for data to load after reload

    console.log('📸 Taking final screenshot of the child dashboard...');
    await page.screenshot({ 
      path: SCREENSHOT_PATH,
      fullPage: true 
    });

    console.log(`\n✅ Child switching test complete!`);
    console.log(`🖼️ Screenshot saved to: ${SCREENSHOT_PATH}`);

  } catch (error) {
    console.error('❌ Failed during child switching test.', error);
  } finally {
    await browser.close();
  }
}

testChildSwitching();
