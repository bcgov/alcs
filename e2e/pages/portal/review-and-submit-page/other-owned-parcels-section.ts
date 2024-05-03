import { expect, type Locator, type Page } from '@playwright/test';

export class OtherOwnedParcelsSection {
  readonly page: Page;
  readonly hasOtherParcelsText: Locator;
  readonly descriptionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hasOtherParcelsText = page.getByTestId('has-other-parcels');
    this.descriptionText = page.getByTestId('other-parcels-description');
  }

  async expectHasOtherParcels(hasOtherParcels: boolean) {
    await expect(this.hasOtherParcelsText).toHaveText(hasOtherParcels ? 'Yes' : 'No');
  }

  async expectDescription(description: string) {
    await expect(this.descriptionText).toHaveText(description);
  }
}
