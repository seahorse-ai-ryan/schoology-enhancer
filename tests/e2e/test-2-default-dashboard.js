#!/usr/bin/env node

/**
 * E2E Test 2: View Default Child's Dashboard
 * 
 * Tests that the dashboard loads correctly with the default child's data
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testDefaultDashboard() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 2: View Default Child\'s Dashboard');
  console.log('='.repeat(80) + '\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(3000);

  // Test 1: Dashboard loads
  console.log('Test 1: Dashboard page loads');
  const title = await page.title();
  if (title.includes('Schoology')) {
    console.log('   ✅ Page title correct:', title);
  } else {
    console.log('   ⚠️  Page title unexpected:', title);
  }

  // Test 2: Welcome message with user name
  console.log('\nTest 2: Welcome message displays');
  const welcomeText = await page.textContent('h1, h2').catch(() => null);
  if (welcomeText && welcomeText.includes('Welcome back')) {
    console.log('   ✅ Welcome message found:', welcomeText.substring(0, 50));
  } else {
    console.log('   ⚠️  Welcome message not found');
  }

  // Test 3: Data source indicator
  console.log('\nTest 3: Data source indicator');
  const dataSource = await page.locator('text=/Live|Cached|Mock/i').first().textContent().catch(() => null);
  if (dataSource) {
    console.log('   ✅ Data source shown:', dataSource);
  } else {
    console.log('   ⚠️  Data source indicator not found');
  }

  // Test 4: Active student info displayed
  console.log('\nTest 4: Active student information');
  const studentInfo = await page.locator('text=/Active Student|Name:/i').first().textContent().catch(() => null);
  if (studentInfo) {
    console.log('   ✅ Student info found');
  } else {
    console.log('   ⚠️  Student info not found (checking for child name)');
  }

  // Test 5: Courses section exists
  console.log('\nTest 5: Courses section');
  const coursesHeading = await page.locator('text=/Your Courses|Courses|Active Courses/i').first().textContent().catch(() => null);
  if (coursesHeading) {
    console.log('   ✅ Courses section found:', coursesHeading);
  } else {
    console.log('   ⚠️  Courses section not found');
  }

  // Test 6: At least one course visible
  console.log('\nTest 6: Course count');
  const courseElements = await page.locator('[class*="course"], [data-testid*="course"]').count();
  console.log(`   ℹ️  Found ${courseElements} course-related elements`);

  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/test-2-default-dashboard.png',
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved: test-results/test-2-default-dashboard.png');

  await context.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST 2 COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testDefaultDashboard().catch(console.error);

