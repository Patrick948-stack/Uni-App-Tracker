import { Page } from '@playwright/test';

export async function seedApp(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /skip/i }).click();
  await page.waitForLoadState('networkidle');
}
