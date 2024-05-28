import { expect, type Locator, type Page } from '@playwright/test';
import { type LandUseDetails } from '../../portal/land-use-page';

export class LandUseSection {
  readonly page: Page;
  readonly currentAgricultureText: Locator;
  readonly improvementsText: Locator;
  readonly otherUsesText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.currentAgricultureText = page.getByTestId('parcels-agriculture-description');
    this.improvementsText = page.getByTestId('parcels-agriculture-improvement-description');
    this.otherUsesText = page.getByTestId('parcels-non-agriculture-description');
  }

  async expectLandUse(landUse: LandUseDetails) {
    await expect(this.currentAgricultureText).toHaveText(landUse.currentAgriculture);
    await expect(this.improvementsText).toHaveText(landUse.improvements);
    await expect(this.otherUsesText).toHaveText(landUse.otherUses);

    for (const [direction, neighbouring] of landUse.neighbouringLandUse) {
      await expect(this.page.getByTestId(`${direction}-land-use-type`)).toHaveText(neighbouring.type);
      await expect(this.page.getByTestId(`${direction}-land-use-description`)).toHaveText(neighbouring.activity);
    }
  }
}
