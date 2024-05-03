import { type Locator, type Page } from '@playwright/test';

export class GovernmentPage {
  readonly page: Page;
  readonly textbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textbox = page.getByPlaceholder('Type government');
  }

  async fill(name: string) {
    // Type half the name
    await this.textbox.fill(name.slice(0, Math.floor(name.length / 2)));
    // Find in autocomplete list
    await this.page.getByText(name).click();
  }
}
