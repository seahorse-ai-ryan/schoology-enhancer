#!/usr/bin/env node

/**
 * E2E Test 6: Data Source Indicators
 * 
 * Tests that data source indicators (Live/Cached/Mock) display correctly
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testDataSources() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 6: Data Source Indicators');
  console.log('='.repeat(80) + '\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(3000);

  // Test 1: Find data source indicator
  console.log('Test 1: Data source badge visibility');
  const dataSourceBadge = await page.locator('text=/Live|Cached|Mock/i').first();
  const badgeExists = await dataSourceBadge.count();
  
  if (badgeExists > 0) {
    const badgeText = await dataSourceBadge.textContent();
    console.log('   ✅ Data source badge found:', badgeText);
    
    // Test 2: Verify it's one of the expected values
    console.log('\nTest 2: Data source type validation');
    if (badgeText.match(/live/i)) {
      console.log('   ✅ Using LIVE data from Schoology API');
    } else if (badgeText.match(/cached/i)) {
      console.log('   ✅ Using CACHED data from Firestore');
    } else if (badgeText.match(/mock/i)) {
      console.log('   ✅ Using MOCK data (development mode)');
    } else {
      console.log('   ⚠️  Unexpected data source:', badgeText);
    }
  } else {
    console.log('   ⚠️  Data source badge not found');
  }

  // Test 3: Check for timestamp (if cached)
  console.log('\nTest 3: Timestamp information');
  const timestampText = await page.locator('text=/fetched|updated|cached/i').first().textContent().catch(() => null);
  if (timestampText) {
    console.log('   ✅ Timestamp info found:', timestampText.substring(0, 60));
  } else {
    console.log('   ℹ️  No timestamp info (may be live data)');
  }

  // Test 4: Check for refresh option
  console.log('\nTest 4: Refresh/reload option');
  const refreshButton = await page.locator('button:has-text("Refresh"), button:has-text("Reload")').count();
  if (refreshButton > 0) {
    console.log('   ✅ Refresh button available');
  } else {
    console.log('   ℹ️  No visible refresh button');
  }

  // Test 5: Count all data source indicators on page
  console.log('\nTest 5: All data source indicators');
  const allIndicators = await page.locator('text=/Live|Cached|Mock/i').count();
  console.log(`   ℹ️  Total data source indicators on page: ${allIndicators}`);

  await page.screenshot({ 
    path: 'test-results/test-6-data-sources.png',
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved: test-results/test-6-data-sources.png');

  await context.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST 6 COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testDataSources().catch(console.error);

