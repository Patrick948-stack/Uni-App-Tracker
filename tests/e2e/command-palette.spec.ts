import { expect, test } from '@playwright/test';
import { seedApp } from './helpers';

test('opens the command palette and navigates to essays', async ({ page }) => {
  await seedApp(page);

  await page.keyboard.press('Meta+K');
  await page.getByPlaceholder(/type a command or search/i).fill('essay');
  await page.getByRole('option').filter({ hasText: /go to essays/i }).first().click();

  await expect(page.getByRole('heading', { name: /essays/i })).toBeVisible();
});
