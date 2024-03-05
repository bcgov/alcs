import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4201/');
  await page.getByRole('button', { name: 'Portal Login' }).click();
  await page.locator('#user').fill(process.env.FAKE_USERNAME ?? '');
  await page.getByLabel('Password').fill(process.env.FAKE_PASSWORD ?? '');
  await page.getByLabel('Password').press('Enter');
  await page.getByRole('heading', { name: 'Portal Inbox' }).click();
});
