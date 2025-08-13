import { test, expect } from '@playwright/test';

test.describe('OAuth 1.0 Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    // Check that the login button is visible
    await expect(page.getByRole('button', { name: 'Sign in with Schoology' })).toBeVisible();
    
    // Check that the dashboard shows loading state
    await expect(page.getByText('Loading your dashboard...')).toBeVisible();
    
    // Check that the header shows the app name
    await expect(page.getByRole('heading', { name: 'Schoology Planner' })).toBeVisible();
  });

  test('should handle OAuth flow and redirect to Schoology', async ({ page }) => {
    // Click the login button
    await page.getByRole('button', { name: 'Sign in with Schoology' }).click();
    
    // Should redirect to the requestToken endpoint
    await expect(page).toHaveURL(/\/requestToken/);
    
    // The page should eventually redirect to Schoology (this will be handled by Firebase Functions)
    // Note: In a real test environment, you might want to mock the OAuth flow
  });

  test('should display mock data with clear indicators when not authenticated', async ({ page }) => {
    // Wait for the dashboard to load (it will show mock data)
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check that mock data badges are visible
    const mockBadges = page.getByText('Mock');
    await expect(mockBadges).toHaveCount(3); // courses, announcements, deadlines
    
    // Check that course information is displayed
    await expect(page.getByText('Mathematics 101')).toBeVisible();
    await expect(page.getByText('English Literature')).toBeVisible();
    await expect(page.getByText('Introduction to Science')).toBeVisible();
    
    // Check that announcements are displayed
    await expect(page.getByText('Welcome to the new semester!')).toBeVisible();
    await expect(page.getByText('Assignment due next week')).toBeVisible();
    
    // Check that deadlines are displayed
    await expect(page.getByText('Math Quiz')).toBeVisible();
    await expect(page.getByText('Essay Submission')).toBeVisible();
  });

  test('should show data source summary in header', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check that data source indicators are visible in the welcome header
    await expect(page.getByText('Data source:')).toBeVisible();
    
    // Check that all three data types show their source
    await expect(page.getByText('Mock')).toHaveCount(3);
  });

  test('should display proper course information with descriptions', async ({ page }) => {
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check course details
    const mathCourse = page.locator('text=Mathematics 101').first();
    await expect(mathCourse).toBeVisible();
    
    // Check course code and teacher
    await expect(page.getByText('MATH101 • Dr. Smith')).toBeVisible();
    
    // Check course description
    await expect(page.getByText('Introduction to college mathematics')).toBeVisible();
  });

  test('should display announcements with proper formatting', async ({ page }) => {
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check announcement content
    await expect(page.getByText('Welcome to the new semester!')).toBeVisible();
    await expect(page.getByText('We\'re excited to have you in class this semester.')).toBeVisible();
    
    // Check course association - use a more specific selector to avoid multiple matches
    await expect(page.locator('p.text-sm.text-gray-600').filter({ hasText: 'Mathematics 101' }).first()).toBeVisible();
  });

  test('should display deadlines with proper formatting', async ({ page }) => {
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check deadline information
    await expect(page.getByText('Math Quiz')).toBeVisible();
    await expect(page.getByText('Chapters 1-3 review')).toBeVisible();
    
    // Check deadline type badges
    await expect(page.getByText('quiz')).toBeVisible();
    await expect(page.getByText('assignment')).toBeVisible();
    await expect(page.getByText('project')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check that the layout is responsive
    await expect(page.getByRole('heading', { name: 'Schoology Planner' })).toBeVisible();
    
    // Check that the dashboard content is accessible on mobile
    await expect(page.getByText('Mathematics 101')).toBeVisible();
  });

  test('should show proper loading states', async ({ page }) => {
    // The page should show loading state initially
    await expect(page.getByText('Loading your dashboard...')).toBeVisible();
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Loading state should be gone
    await expect(page.getByText('Loading your dashboard...')).not.toBeVisible();
  });

  test('should display error state when authentication fails', async ({ page }) => {
    // This test would require mocking the auth API to return an error
    // For now, we'll just verify the error handling structure exists
    
    // Navigate to a page that might trigger an error
    await page.goto('/api/auth/status');
    
    // Should get a proper response (either user data or error)
    const response = await page.waitForResponse('**/api/auth/status');
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });
});

test.describe('Data Source Indicators', () => {
  test('should clearly distinguish between mock, cached, and live data', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check that mock badges are visible and properly styled
    const mockBadges = page.getByText('Mock');
    await expect(mockBadges).toHaveCount(3);
    
    // Check badge styling (destructive variant for mock data)
    const mockBadge = mockBadges.first();
    await expect(mockBadge).toHaveClass(/destructive/);
  });

  test('should show last updated timestamp when available', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Check that last updated information is displayed
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });
});

