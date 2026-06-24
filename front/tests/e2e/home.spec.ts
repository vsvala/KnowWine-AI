import { test, expect } from '@playwright/test';

test('front page can be opened', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const locator = page.getByRole('heading', { level: 1 });
  await expect(locator).toBeVisible();
  await expect(page.getByText('KnowWine AI')).toBeVisible();
});
