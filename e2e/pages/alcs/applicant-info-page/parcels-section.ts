import { expect, type Locator, type Page } from '@playwright/test';
import { type ParcelDetails, type ParcelOwnerDetails } from '../../portal/parcels-page';

export class ParcelsSection {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectParcels(parcels: ParcelDetails[]) {
    for (const [parcel, i] of parcels.map((parcel, i): [ParcelDetails, number] => [parcel, i])) {
      const parcelNumber = i + 1;

      await this.expectParcelDetails(parcelNumber, parcel);
      await this.expectParcelOwners(parcelNumber, parcel.owners);
    }
  }

  async expectParcelDetails(parcelNumber: number, parcel: ParcelDetails) {
    await expect(this.typeText(parcelNumber)).toHaveText(parcel.type);
    await expect(this.legalDescriptionText(parcelNumber)).toHaveText(parcel.legalDescription);
    await expect(this.mapAreaText(parcelNumber)).toHaveText(parcel.mapArea);
    if (parcel.pid !== undefined) {
      await expect(this.pidText(parcelNumber)).toHaveText(parcel.pid);
    }
    if (parcel.pin !== undefined) {
      await expect(this.pinText(parcelNumber)).toHaveText(parcel.pin);
    }
    if (parcel.month !== undefined && parcel.day !== undefined && parcel.year !== undefined) {
      await expect(this.purchaseDateText(parcelNumber)).toHaveText(`${parcel.month} ${parcel.day}, ${parcel.year}`);
    }
    await expect(this.isFarmText(parcelNumber)).toHaveText(parcel.isFarm ? 'Yes' : 'No');
    await expect(this.civicAddressText(parcelNumber)).toHaveText(parcel.civicAddress);
    await expect(this.certificateOfTitleText(parcelNumber)).toHaveText(this.fileName(parcel.certificateOfTitlePath));
  }

  async expectParcelOwners(parcelNumber: number, owners: ParcelOwnerDetails[]) {
    const nameTexts = this.ownerNameTexts(parcelNumber);
    const organizationTexts = this.ownerOrganizationTexts(parcelNumber);
    const phoneNumberTexts = this.ownerPhoneNumberTexts(parcelNumber);
    const emailTexts = this.ownerEmailTexts(parcelNumber);
    const corporateSummaryTexts = this.ownerCorporateSummaryTexts(parcelNumber);

    for (const owner of owners) {
      await expect(nameTexts.filter({ hasText: `${owner.firstName} ${owner.lastName}` })).toBeVisible();
      if (owner.organization !== undefined) {
        await expect(organizationTexts.filter({ hasText: owner.organization })).toBeVisible();
      }
      await expect(phoneNumberTexts.filter({ hasText: owner.phoneNumber.replace(/\D/g, '') })).toBeVisible();
      await expect(emailTexts.filter({ hasText: owner.email })).toBeVisible();
      if (owner.corporateSummaryPath !== undefined) {
        await expect(
          corporateSummaryTexts.filter({ hasText: this.fileName(owner.corporateSummaryPath) }),
        ).toBeVisible();
      }
    }
  }

  // Locator Getters
  // ---------------

  typeText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-type`);
  }

  legalDescriptionText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-legal-description`);
  }

  mapAreaText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-map-area`);
  }

  pidText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-pid`);
  }

  pinText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-pin`);
  }

  purchaseDateText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-purchase-date`);
  }

  isFarmText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-is-farm`);
  }

  civicAddressText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-civic-address`);
  }

  certificateOfTitleText(parcelNumber: number): Locator {
    return this.page.getByTestId(`parcel-${parcelNumber}-certificate-of-title`);
  }

  ownerNameTexts(parcelNumber: number) {
    return this.page.getByTestId(`parcel-${parcelNumber}-owner-name`);
  }

  ownerOrganizationTexts(parcelNumber: number) {
    return this.page.getByTestId(`parcel-${parcelNumber}-owner-organization`);
  }

  ownerPhoneNumberTexts(parcelNumber: number) {
    return this.page.getByTestId(`parcel-${parcelNumber}-owner-phone-number`);
  }

  ownerEmailTexts(parcelNumber: number) {
    return this.page.getByTestId(`parcel-${parcelNumber}-owner-email`);
  }

  ownerCorporateSummaryTexts(parcelNumber: number) {
    return this.page.getByTestId(`parcel-${parcelNumber}-owner-corporate-summary`);
  }

  // Utils
  // -----

  fileName(path: string): string {
    return path.substring(path.lastIndexOf('/') + 1);
  }
}
