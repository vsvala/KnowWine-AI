import { test, expect } from '@playwright/test';

test('navigation links are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wines' })).toBeVisible();
});

test('wines page shows wine list', async ({ page }) => {
  await page.goto('/wines');
  await expect(page).toHaveURL('/wines');
});
//npm run test:e2e
//to see browser:
//npx playwright test --ui

//npm test -- --project chromium

//npm test -- -g'one of those can be made nonimportant' --debug
// await page.pause()
//npm run test -- --trace on
//npx playwright show-report
