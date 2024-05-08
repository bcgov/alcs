import { type Locator, type Page } from '@playwright/test';

export class ALCSMainNavigation {
  readonly page: Page;
  readonly boardsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.boardsLink = page.getByRole('button', { name: 'Boards' });
  }

  async gotoBoardPage(board: string) {
    await this.boardsLink.click();
    await this.boardLink(board).click();
  }

  boardLink(board: string): Locator {
    return this.page.getByRole('menu').getByText(board);
  }
}
