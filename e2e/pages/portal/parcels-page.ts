import { expect, type Locator, type Page } from '@playwright/test';

export enum ParcelType {
  FeeSimple = 'Fee Simple',
  Crown = 'Crown',
}

export enum OwnerType {
  Individual = 'Individual',
  Organization = 'Organization',
  ProvincialCrown = 'Provincial Crown',
  FederalCrown = 'Federal Crown',
}

export interface ParcelDetails {
  type: ParcelType;
  legalDescription: string;
  mapArea: string;
  pid?: string;
  pin?: string;
  year?: string;
  month?: string;
  day?: string;
  isFarm: boolean;
  civicAddress: string;
  certificateOfTitlePath: string;
  isConfirmed: boolean;
  owners: ParcelOwnerDetails[];
}

export interface ParcelOwnerDetails {
  type: OwnerType;
  organization?: string;
  corporateSummaryPath?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export class ParcelsPage {
  readonly page: Page;
  readonly parcelAddButton: Locator;
  readonly ownerAddDialog: Locator;
  readonly ownerOrganizationTexbox: Locator;
  readonly ownerMinistryTexbox: Locator;
  readonly ownerFirstNameTexbox: Locator;
  readonly ownerLastNameTexbox: Locator;
  readonly ownerPhoneNumberTexbox: Locator;
  readonly ownerEmailTexbox: Locator;
  readonly ownerSaveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.parcelAddButton = page.getByRole('button', { name: 'Add another parcel to the application' });
    this.ownerAddDialog = page.getByRole('dialog', { name: 'Add New Owner' });
    this.ownerOrganizationTexbox = page.getByPlaceholder('Enter Organization Name');
    this.ownerMinistryTexbox = page.getByPlaceholder('Type ministry or department name');
    this.ownerFirstNameTexbox = page.getByPlaceholder('Enter First Name');
    this.ownerLastNameTexbox = page.getByPlaceholder('Enter Last Name');
    this.ownerPhoneNumberTexbox = page.getByPlaceholder('(555) 555-5555');
    this.ownerEmailTexbox = page.getByPlaceholder('Enter Email');
    this.ownerSaveButton = page.getByRole('button', { name: 'Add' });
  }

  // Scenarios
  // ---------

  async fill(parcels: ParcelDetails[]) {
    for (const [parcel, i] of parcels.map((parcel, i): [ParcelDetails, number] => [parcel, i])) {
      const parcelNumber = i + 1;

      await this.fillParcelDetails(parcelNumber, parcel);

      for (const owner of parcel.owners) {
        await this.addOwner(parcelNumber, owner);
      }

      if (parcel.isConfirmed) {
        await this.checkConfirmationCheckbox(parcelNumber);
      }
    }
  }

  /* Assumptions:
   *   - parcel must be expanded, so must be added sequentially, though
   *     this is currently not reliable.
   */
  async fillParcelDetails(parcelNumber: number, parcel: ParcelDetails) {
    if (parcel.type === ParcelType.FeeSimple) {
      // Make sure required details are supplied
      await expect(parcel.pid).toBeDefined();
      await expect(parcel.year).toBeDefined();
      await expect(parcel.month).toBeDefined();
      await expect(parcel.day).toBeDefined();
    }

    await this.setParcelType(parcelNumber, parcel.type);
    await this.legalDescriptionTexbox(parcelNumber).fill(parcel.legalDescription);
    await this.mapAreaTexbox(parcelNumber).fill(parcel.mapArea);

    if (parcel.pid !== undefined) {
      await this.pidTexbox(parcelNumber).fill(parcel.pid);
    }

    if (parcel.type === ParcelType.Crown && parcel.pin !== undefined) {
      await this.pinTexbox(parcelNumber).fill(parcel.pin);
    }

    if (
      parcel.type === ParcelType.FeeSimple &&
      parcel.year !== undefined &&
      parcel.month !== undefined &&
      parcel.day !== undefined
    ) {
      await this.setDate(parcelNumber, parcel.year, parcel.month, parcel.day);
    }

    await this.setIsFarm(parcelNumber, parcel.isFarm);
    await this.civicAddressTexbox(parcelNumber).fill(parcel.civicAddress);
    await this.uploadCertificateOfTitle(parcelNumber, parcel.certificateOfTitlePath);
  }

  /* Assumptions:
   *   - parcel must be expanded, so must be added sequentially, though
   *     this is currently not reliable.
   */
  async addOwner(parcelNumber: number, owner: ParcelOwnerDetails) {
    const parcelType = await this.parcelType(parcelNumber);

    if (parcelType === ParcelType.FeeSimple) {
      await this.nonCrownOwnerAddButton(parcelNumber).click();
      await expect([OwnerType.Individual, OwnerType.Organization]).toContain(owner.type);
    } else if (parcelType === ParcelType.Crown) {
      await this.crownOwnerAddButton(parcelNumber).click();
      await expect([OwnerType.ProvincialCrown, OwnerType.FederalCrown]).toContain(owner.type);
    }

    if ([OwnerType.Organization, OwnerType.ProvincialCrown, OwnerType.FederalCrown].includes(owner.type)) {
      await expect(owner.organization).toBeDefined();
    }
    if (owner.type === OwnerType.Organization) {
      await expect(owner.corporateSummaryPath).toBeDefined();
    }

    await this.setOwnerType(owner.type);

    if (
      owner.type === OwnerType.Organization &&
      owner.organization !== undefined &&
      owner.corporateSummaryPath !== undefined
    ) {
      await this.ownerOrganizationTexbox.fill(owner.organization);
      await this.uploadCorporateSummary(owner.corporateSummaryPath);
    } else if (
      (owner.type === OwnerType.ProvincialCrown || owner.type === OwnerType.FederalCrown) &&
      owner.organization !== undefined
    ) {
      await this.ownerMinistryTexbox.fill(owner.organization);
    }

    // Universal fields
    await this.ownerFirstNameTexbox.fill(owner.firstName);
    await this.ownerLastNameTexbox.fill(owner.lastName);
    await this.ownerPhoneNumberTexbox.fill(owner.phoneNumber);
    await this.ownerEmailTexbox.fill(owner.email);

    await this.ownerSaveButton.click();

    // Wait for dialog to disappear
    await expect(this.ownerAddDialog).toBeHidden();
  }

  // Actions
  // -------

  async addParcel() {
    await this.parcelAddButton.click();
  }

  async setParcelType(parcelNumber: number, parcelType: ParcelType) {
    await this.parcelBody(parcelNumber).getByRole('button', { name: parcelType }).click();
  }

  // Month uses 3-letter abbreviation (e.g., 'Apr')
  async setDate(parcelNumber: number, year: string, month: string, day: string) {
    const calendarButton = await this.parcelBody(parcelNumber).getByRole('button', { name: 'Open calendar' });
    await calendarButton.evaluate((e) => {
      e.scrollIntoView({ block: 'center', inline: 'center' });
    });
    await this.page.waitForTimeout(500);
    await calendarButton.click();
    // Can't have more than one datepicker open at once
    // We just have to trust the correct one is still open
    await this.page.getByRole('button', { name: year }).click();
    await this.page.getByRole('button').getByText(month).click();
    await this.page.getByRole('button', { name: day }).click();
  }

  async setIsFarm(parcelNumber: number, isFarm: boolean) {
    await this.parcelBody(parcelNumber)
      .getByRole('button', { name: isFarm ? 'Yes' : 'Else' })
      .click();
  }

  async uploadCertificateOfTitle(parcelNumber: number, path: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.parcelBody(parcelNumber).getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }

  async setOwnerType(type: OwnerType) {
    await this.page.getByRole('button', { name: type }).click();
  }

  async uploadCorporateSummary(path: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.ownerAddDialog.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }

  async checkConfirmationCheckbox(parcelNumber: number) {
    await this.confirmationCheckbox(parcelNumber).check();
  }

  // Locator Getters
  // ---------------

  parcelHeading(parcelNumber: number): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^\s*Parcel #${parcelNumber}`) });
  }

  // parcelNumber is 1-indexed (i.e., the user-facing parcel number)
  parcelBody(parcelNumber: number): Locator {
    return this.page.getByRole('region', { name: `Parcel #${parcelNumber}`, includeHidden: true });
  }

  legalDescriptionTexbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByPlaceholder('Type legal description');
  }

  mapAreaTexbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByPlaceholder('Type parcel size');
  }

  pidTexbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByPlaceholder('Type PID');
  }

  pinTexbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByPlaceholder('Type PIN');
  }

  civicAddressTexbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByPlaceholder('Type Address');
  }

  nonCrownOwnerAddButton(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByRole('button', { name: 'Add new owner' });
  }

  crownOwnerAddButton(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByRole('button', { name: 'Add new gov contact' });
  }

  confirmationCheckbox(parcelNumber: number): Locator {
    return this.parcelBody(parcelNumber).getByRole('checkbox', {
      name: 'I confirm that the owner information provided above matches the current Certificate',
    });
  }

  // State Getters
  // -------------

  async parcelType(parcelNumber: number): Promise<ParcelType> {
    const results = await Promise.all(
      Object.values(ParcelType).map(
        (type) =>
          new Promise<[ParcelType, boolean]>((resolve) => {
            this.parcelBody(parcelNumber)
              .getByRole('button', { name: type })
              .getAttribute('aria-pressed')
              .then((isPressed) => {
                resolve([type, isPressed === 'true']);
              });
          }),
      ),
    );
    const [type, _] = results.filter(([_, isPressed]) => isPressed)[0];

    return type;
  }
}
