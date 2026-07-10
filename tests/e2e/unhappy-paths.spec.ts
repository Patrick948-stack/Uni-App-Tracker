import { expect, test } from '@playwright/test';
import { seedApp } from './helpers';

test('shows validation feedback when required fields are missing', async ({ page }) => {
  await seedApp(page);

  await page.getByRole('button', { name: '+ Add' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add' }).last().click();

  await expect(page.getByText('University name is required.')).toBeVisible();
});
