const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome'
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('📱 Navigating to dashboard...');
  await page.goto('https://modernteaching.ngrok.dev/dashboard', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('⏳ Waiting for page to load...');
  await page.waitForTimeout(3000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ 
    path: 'test-results/dashboard-screenshot.png',
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved to: test-results/dashboard-screenshot.png');
  console.log('🚪 Closing browser...');
  await browser.close();
})();
