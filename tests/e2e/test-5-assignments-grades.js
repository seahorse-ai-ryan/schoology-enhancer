#!/usr/bin/env node

/**
 * E2E Test 5: Assignments & Grades
 * 
 * Tests viewing assignments and grade information
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testAssignmentsGrades() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 5: Assignments & Grades');
  console.log('='.repeat(80) + '\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(3000);

  // Test 1: Look for assignments section
  console.log('Test 1: Assignments section');
  const assignmentsText = await page.locator('text=/assignment|homework|upcoming/i').first().textContent().catch(() => null);
  if (assignmentsText) {
    console.log('   ✅ Assignments section found:', assignmentsText.substring(0, 50));
  } else {
    console.log('   ⚠️  Assignments section not found');
  }

  // Test 2: Count assignment-related elements
  console.log('\nTest 2: Assignment elements');
  const assignmentCount = await page.locator('[class*="assignment"], [data-testid*="assignment"]').count();
  console.log(`   ℹ️  Found ${assignmentCount} assignment-related elements`);

  // Test 3: Check for deadlines/dates
  console.log('\nTest 3: Upcoming deadlines');
  const deadlineText = await page.locator('text=/deadline|due|upcoming/i').first().textContent().catch(() => null);
  if (deadlineText) {
    console.log('   ✅ Deadline information found');
  } else {
    console.log('   ⚠️  Deadline information not prominently displayed');
  }

  // Test 4: Look for grades/progress
  console.log('\nTest 4: Grade information');
  const gradeElements = await page.locator('text=/grade|score|points|%/i').count();
  console.log(`   ℹ️  Found ${gradeElements} grade-related text elements`);

  // Test 5: Check for new announcements count
  console.log('\nTest 5: Announcements indicator');
  const announcementsText = await page.locator('text=/announcement|new/i').first().textContent().catch(() => null);
  if (announcementsText) {
    console.log('   ✅ Announcements indicator found');
  } else {
    console.log('   ⚠️  Announcements not prominently shown');
  }

  await page.screenshot({ 
    path: 'test-results/test-5-assignments-grades.png',
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved: test-results/test-5-assignments-grades.png');

  await context.close();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST 5 COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testAssignmentsGrades().catch(console.error);

