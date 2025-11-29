import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage with correct title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Home | Calculator Boilerplate');
  });

  test('should display the hero section with main heading', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toContainText('Get Your Instant Quote');
  });

  test('should have a working "Start Calculator" button', async ({ page }) => {
    await page.goto('/');

    const startButton = page.getByRole('link', { name: /start calculator/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page).toHaveURL(/\/calculator\/step-01/);
  });

  test('should display the features section', async ({ page }) => {
    await page.goto('/');

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    await expect(page.getByText('Lightning Fast')).toBeVisible();
    await expect(page.getByText('Accurate Pricing')).toBeVisible();
    await expect(page.getByText('Secure & Private')).toBeVisible();
  });

  test('should display the "How It Works" section', async ({ page }) => {
    await page.goto('/');

    const howItWorksSection = page.locator('#how-it-works');
    await expect(howItWorksSection).toBeVisible();

    await expect(page.getByText('Enter Your Requirements')).toBeVisible();
    await expect(page.getByText('Get Instant Quote')).toBeVisible();
    await expect(page.getByText('Review & Proceed')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'How it Works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
  });
});
