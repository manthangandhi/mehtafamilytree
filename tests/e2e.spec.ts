import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'testuser_1781526446249@example.com';
const TEST_PASSWORD = 'password123';

test.describe('Digital Family Directory E2E', () => {
  test('End to end flow', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Add Household
    await page.goto('http://localhost:3000/admin/households/new');
    await page.getByLabel('Primary Member Name (Head) *').fill('Test Head');
    await page.getByLabel('City').fill('TestCity');

    // Fill first Family member in the repeater
    await page.getByLabel('Full Name *').first().fill('Test Head Member');
    await page.getByLabel('Relationship to Head').first().selectOption({ label: 'SELF' });

    await page.click('button:has-text("Create Household")');
    await expect(page.locator('text=Household created successfully')).toBeVisible({ timeout: 10000 });
    
    // 3. View Directory
    await page.goto('http://localhost:3000/directory');
    await expect(page.locator('text=Test Head Member')).toBeVisible();

    // 4. Admin Announcements
    await page.goto('http://localhost:3000/admin/announcements/new');
    await page.getByLabel('Title').fill('Important Meeting');
    await page.getByLabel('Content').fill('Please attend the virtual meeting.');
    await page.click('button:has-text("Publish")');
    // Wait for redirect to announcements
    await expect(page).toHaveURL(/.*\/admin\/announcements/);

    // 5. Verify Announcement on Dashboard
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=Important Meeting')).toBeVisible();

  });
});
