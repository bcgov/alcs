import { test as base, Page } from '@playwright/test';
export { expect } from '@playwright/test';

export enum UserPrefix {
  BceidBasic = 'BCEID_BASIC',
}

interface FixtureOptions {
  userPrefix: string;
}

interface Fixtures {
  inboxLoggedIn: Page;
}

export const test = base.extend<FixtureOptions & Fixtures>({
  userPrefix: UserPrefix.BceidBasic,
  inboxLoggedIn: async ({ page, userPrefix }, use) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Portal Login' }).click();
    await page
      .locator('#user')
      .fill(process.env[userPrefix + '_USERNAME'] ?? '');
    await page
      .getByLabel('Password')
      .fill(process.env[userPrefix + '_PASSWORD'] ?? '');
    await page.getByRole('button', { name: /continue/i }).click();
    await use(page);
  },
});
