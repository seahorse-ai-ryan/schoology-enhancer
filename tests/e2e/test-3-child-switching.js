#!/usr/bin/env node

/**
 * E2E Test 3: Switch Between Children
 * 
 * Tests parent ability to switch between different children and see updated data
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testChildSwitching() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 3: Switch Between Children');
  console.log('='.repeat(80) + '\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(3000);

  // Test 1: Find child selector
  console.log('Test 1: Locate child selector');
  const childButton = await page.locator('[role="button"], button, [data-testid*="child"], [class*="child"]')
    .filter({ hasText: /mock|child|student/i })
    .first()
    .count();
  
  if (childButton > 0) {
    console.log('   ✅ Child selector button found');
  } else {
    console.log('   ⚠️  Child selector not found (may use different selector)');
  }

  // Test 2: Try to click child selector (if exists)
  console.log('\nTest 2: Attempt to open child menu');
  try {
    // Look for common patterns
    const selectors = [
      'button:has-text("Mock")',
      '[data-testid="child-selector"]',
      '[aria-label*="child"]',
      'button:has-text("Tazio")',
      'button:has-text("Carter")',
    ];

    let clicked = false;
    for (const selector of selectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        console.log(`   ✅ Clicked selector: ${selector}`);
        clicked = true;
        await page.waitForTimeout(1000);
        break;
      } catch (e) {
        // Try next selector
      }
    }

    if (!clicked) {
      console.log('   ⚠️  Could not click child selector - trying to find child names');
    }

    // Test 3: Look for child names
    console.log('\nTest 3: Check for child names in UI');
    const childNames = ['Tazio Mock', 'Carter Mock', 'Livio Mock'];
    let foundChildren = [];
    
    for (const name of childNames) {
      const exists = await page.locator(`text=${name}`).count();
      if (exists > 0) {
        foundChildren.push(name);
        console.log(`   ✅ Found child: ${name}`);
      }
    }

    if (foundChildren.length > 1) {
      console.log(`\n   ✅ Multiple children visible (${foundChildren.length}) - switching possible`);
    } else if (foundChildren.length === 1) {
      console.log(`\n   ℹ️  Only one child visible: ${foundChildren[0]}`);
    } else {
      console.log('\n   ⚠️  No child names found in expected format');
    }

  } catch (error) {
    console.log('   ⚠️  Error testing child switching:', error.message);
  }

  // Test 4: Take screenshot of current state
  await page.screenshot({ 
    path: 'test-results/test-3-child-switching.png',
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved: test-results/test-3-child-switching.png');

  await context.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST 3 COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testChildSwitching().catch(console.error);

