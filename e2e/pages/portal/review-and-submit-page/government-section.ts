import { expect, type Locator, type Page } from '@playwright/test';

export class GovernmentSection {
  readonly page: Page;
  readonly text: Locator;

  constructor(page: Page) {
    this.page = page;
    this.text = page.getByTestId('government-name');
  }

  async expectGovernment(government: string) {
    await expect(this.text).toHaveText(government);
  }
}
