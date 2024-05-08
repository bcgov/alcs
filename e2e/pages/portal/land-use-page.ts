import { expect, type Locator, type Page } from '@playwright/test';

export enum Direction {
  North = 'north',
  East = 'east',
  South = 'south',
  West = 'west',
}

export enum LandUseType {
  Agricultural = 'Agricultural / Farm',
  Civic = 'Civic / Institutional',
  Commercial = 'Commercial / Retail',
  Industrial = 'Industrial',
  Other = 'Other',
  Recreational = 'Recreational',
  Residential = 'Residential',
  Transportation = 'Transportation / Utilities',
  Unused = 'Unused',
}

export interface LandUseDetails {
  currentAgriculture: string;
  improvements: string;
  otherUses: string;
  neighbouringLandUse: Map<Direction, NeighbouringLandUse>;
}

interface NeighbouringLandUse {
  type: LandUseType;
  activity: string;
}

export class LandUsePage {
  readonly page: Page;
  readonly currentAgricultureTextField: Locator;
  readonly improvementsTextField: Locator;
  readonly otherUsesTextField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.currentAgricultureTextField = page.getByRole('textbox', {
      name: 'Describe all agriculture that currently takes place on the parcel(s).',
    });
    this.improvementsTextField = page.getByRole('textbox', {
      name: 'Describe all agricultural improvements made to the parcel(s).',
    });
    this.otherUsesTextField = page.getByRole('textbox', {
      name: 'Describe all other uses that currently take place on the parcel(s).',
    });
  }

  async fill(landUse: LandUseDetails) {
    await this.currentAgricultureTextField.fill(landUse.currentAgriculture);
    await this.improvementsTextField.fill(landUse.improvements);
    await this.otherUsesTextField.fill(landUse.otherUses);

    for (const [direction, { type, activity }] of landUse.neighbouringLandUse) {
      await this.setNeighbouringType(direction, type);
      await this.neighbouringActivityTextbox(direction).fill(activity);
    }
  }

  async setNeighbouringType(direction: Direction, type: LandUseType) {
    await this.neighbouringTypeCombobox(direction).click();
    await this.page.getByRole('option', { name: type }).click();
    await expect(this.page.getByRole('listbox')).toBeHidden();
  }

  neighbouringTypeCombobox(direction: Direction): Locator {
    return this.page.getByTestId(`${direction}-type-combobox`);
  }

  neighbouringActivityTextbox(direction: Direction): Locator {
    return this.page.getByTestId(`${direction}-activity-textbox`);
  }
}
