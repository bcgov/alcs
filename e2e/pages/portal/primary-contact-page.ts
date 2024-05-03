import { type Locator, type Page } from '@playwright/test';

export enum PrimaryContactType {
  LandOwner = 'Land Owner',
  ThirdParty = 'Third-Party Agent',
}

export interface ThirdPartyContactDetails {
  firstName: string;
  lastName: string;
  organization?: string;
  phoneNumber: string;
  email: string;
}

export class PrimaryContactPage {
  readonly page: Page;
  readonly yesButton: Locator;
  readonly noButton: Locator;
  readonly firstNameTextbox: Locator;
  readonly lastNameTextbox: Locator;
  readonly organizationTextbox: Locator;
  readonly phoneNumberTextbox: Locator;
  readonly emailTextbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yesButton = page.getByRole('button', { name: 'Yes', exact: true });
    this.noButton = page.getByRole('button', { name: 'No', exact: true });
    this.firstNameTextbox = page.getByPlaceholder('Enter First Name');
    this.lastNameTextbox = page.getByPlaceholder('Enter Last Name');
    this.organizationTextbox = page.getByPlaceholder('Enter Organization Name');
    this.phoneNumberTextbox = page.getByPlaceholder('(555) 555-5555');
    this.emailTextbox = page.getByPlaceholder('Enter Email');
  }

  async setPrimaryContactType(type: PrimaryContactType) {
    if (type === PrimaryContactType.ThirdParty) {
      await this.noButton.click();
    } else {
      await this.yesButton.click();
    }
  }

  async selectExistingContact(firstName: string, lastName: string) {
    await this.page.getByRole('radio', { name: `${firstName} ${lastName}` }).check();
  }

  async fillThirdPartyContact(contact: ThirdPartyContactDetails) {
    await this.firstNameTextbox.fill(contact.firstName);
    await this.lastNameTextbox.fill(contact.lastName);
    if (contact.organization !== undefined) {
      await this.organizationTextbox.fill(contact.organization);
    }
    await this.phoneNumberTextbox.fill(contact.phoneNumber);
    await this.emailTextbox.fill(contact.email);
  }

  async uploadAuthorizationLetters(paths: string[]) {
    for (const path of paths) {
      const fileChooserPromise = this.page.waitForEvent('filechooser');
      await this.page.getByRole('button', { name: 'Choose file to Upload', exact: true }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path);
    }
  }
}
