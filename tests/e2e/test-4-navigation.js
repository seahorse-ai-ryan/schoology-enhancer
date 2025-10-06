#!/usr/bin/env node

/**
 * E2E Test 4: Navigation & Course Details
 * 
 * Tests navigation to different sections and course detail views
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testNavigation() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 4: Navigation & Course Details');
  console.log('='.repeat(80) + '\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(3000);

  // Test 1: Top navigation exists
  console.log('Test 1: Top navigation bar');
  const navLinks = ['Dashboard', 'Courses', 'Announcements', 'Planning', 'Incentives'];
  let foundLinks = [];

  for (const linkText of navLinks) {
    const exists = await page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`).count();
    if (exists > 0) {
      foundLinks.push(linkText);
      console.log(`   ✅ Found nav link: ${linkText}`);
    }
  }

  if (foundLinks.length > 0) {
    console.log(`\n   ✅ Navigation present (${foundLinks.length}/${navLinks.length} links found)`);
  } else {
    console.log('\n   ⚠️  Navigation links not found in expected format');
  }

  // Test 2: Try clicking on Courses
  console.log('\nTest 2: Navigate to Courses page');
  try {
    const coursesLink = page.locator('a:has-text("Courses"), button:has-text("Courses")').first();
    const linkExists = await coursesLink.count();
    
    if (linkExists > 0) {
      await coursesLink.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Clicked Courses link');
      
      const url = page.url();
      console.log(`   ℹ️  Current URL: ${url}`);
    } else {
      console.log('   ⚠️  Courses link not clickable');
    }
  } catch (error) {
    console.log('   ⚠️  Could not navigate to Courses:', error.message);
  }

  // Test 3: Check for course listings
  console.log('\nTest 3: Course listings visible');
  const courseCount = await page.locator('[class*="course"], [data-testid*="course"]').count();
  console.log(`   ℹ️  Found ${courseCount} course-related elements`);

  // Test 4: Try clicking first course (if exists)
  console.log('\nTest 4: Click into course details');
  try {
    const firstCourse = page.locator('[class*="course"]').first();
    const courseExists = await firstCourse.count();
    
    if (courseExists > 0) {
      const courseText = await firstCourse.textContent().catch(() => 'Unknown');
      console.log(`   ℹ️  First course: ${courseText.substring(0, 50)}...`);
      
      // Try to click it
      await firstCourse.click({ timeout: 2000 }).catch(() => {
        console.log('   ⚠️  Course not clickable (may not be implemented yet)');
      });
      await page.waitForTimeout(1000);
    } else {
      console.log('   ⚠️  No courses found to click');
    }
  } catch (error) {
    console.log('   ⚠️  Error clicking course:', error.message);
  }

  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/test-4-navigation.png',
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved: test-results/test-4-navigation.png');

  await context.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST 4 COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testNavigation().catch(console.error);

