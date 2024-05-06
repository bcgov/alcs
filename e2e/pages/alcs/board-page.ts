import { expect, type Locator, type Page } from '@playwright/test';

export class ALCSBoardPage {
  readonly page: Page;
  readonly cards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cards = page.getByTestId('card');
  }

  async expectCard(fileId: string) {
    await expect(this.cards.filter({ hasText: fileId })).toBeVisible();
  }
}
