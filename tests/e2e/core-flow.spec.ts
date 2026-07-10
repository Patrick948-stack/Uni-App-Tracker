import { expect, test } from '@playwright/test';
import { seedApp } from './helpers';

test('can add a university and enable focus mode', async ({ page }) => {
  await seedApp(page);

  await page.getByRole('button', { name: '+ Add' }).click();
  await page.getByRole('dialog').getByLabel(/university name/i).fill('Harvard University');
  await page.getByRole('dialog').getByLabel(/deadline/i).fill('2026-12-15');
  await page.getByRole('dialog').getByRole('button', { name: 'Add' }).last().click();

  await expect(page.getByText('University added.')).toBeVisible();
  await page.getByLabel(/select a school for focus mode/i).selectOption({ label: 'Harvard University' });
  await page.getByRole('button', { name: /start focus/i }).click();

  await expect(page.getByText(/currently focused on/i)).toContainText('Harvard University');
});
