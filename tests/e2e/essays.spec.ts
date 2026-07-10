import { expect, test } from '@playwright/test';
import { seedApp } from './helpers';

test('can create an essay for a selected school', async ({ page }) => {
  await seedApp(page);

  await page.getByRole('link', { name: /essays/i }).click();
  await page.getByLabel(/select school/i).selectOption({ index: 1 });
  await page.getByRole('button', { name: '+ Add' }).click();

  await page.getByRole('dialog').getByLabel(/title/i).fill('Why this college?');
  await page.getByRole('dialog').getByRole('button', { name: 'Add' }).last().click();

  await expect(page.getByText('Essay added.')).toBeVisible();
  await expect(page.getByRole('button', { name: /why this college/i }).first()).toBeVisible();
});
