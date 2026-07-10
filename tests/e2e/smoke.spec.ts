import { expect, test } from '@playwright/test';
import { seedApp } from './helpers';

test('loads the app shell and dashboard', async ({ page }) => {
  await seedApp(page);

  await expect(page.getByRole('heading', { name: /next deadlines/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
});
