import { test, expect } from '@playwright/test';

test.describe('Wine app', () => {
  test('wine page can be opened', async ({ page }) => {
    await page.goto('wines');

    const locator = page.getByRole('heading', { name: 'Wines', exact: true });
    await expect(locator).toBeVisible();
    //await expect(page.getByText('Schieferkopf, Lieu Dit Buehl Riesling')).toBeVisible();
    await expect(page.getByRole('link').first()).toBeVisible();
  });
});
