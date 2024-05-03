import { type Locator, type Page } from '@playwright/test';

export class OtherParcelsPage {
  readonly page: Page;
  readonly yesButton: Locator;
  readonly noButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yesButton = page.getByRole('button', { name: 'Yes' });
    this.noButton = page.getByRole('button', { name: 'No' });
  }

  async setHasOtherParcels(hasOtherParcels: boolean) {
    await (hasOtherParcels ? this.yesButton.click() : this.noButton.click());
  }

  async fillDescription(description: string) {
    await this.page
      .getByLabel('Describe the other parcels including their location, who owns or leases them, and their use.')
      .fill(description);
  }
}
