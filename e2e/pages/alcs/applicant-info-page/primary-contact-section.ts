import { expect, type Locator, type Page } from '@playwright/test';
import { PrimaryContactType, type ThirdPartyContactDetails } from '../../portal/primary-contact-page';

export class PrimaryContactSection {
  readonly page: Page;
  readonly typeText: Locator;
  readonly firstNameText: Locator;
  readonly lastNameText: Locator;
  readonly organizationText: Locator;
  readonly phoneNumberText: Locator;
  readonly emailText: Locator;
  readonly authorizationLetterTexts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.typeText = page.getByTestId('primary-contact-type');
    this.firstNameText = page.getByTestId('primary-contact-first-name');
    this.lastNameText = page.getByTestId('primary-contact-last-name');
    this.organizationText = page.getByTestId('primary-contact-organization');
    this.phoneNumberText = page.getByTestId('primary-contact-phone-number');
    this.emailText = page.getByTestId('primary-contact-email');
    this.authorizationLetterTexts = page.getByTestId('authorization-letter');
  }

  async expectThirdPartyContact(contact: ThirdPartyContactDetails) {
    await expect(this.typeText).toHaveText(PrimaryContactType.ThirdParty);
    await expect(this.firstNameText).toHaveText(contact.firstName);
    await expect(this.lastNameText).toHaveText(contact.lastName);
    if (contact.organization !== undefined) {
      await expect(this.organizationText).toHaveText(contact.organization);
    }
    await expect(this.phoneNumberText).toHaveText(contact.phoneNumber.replace(/\D/g, ''));
    await expect(this.emailText).toHaveText(contact.email);
  }

  async expectAuthorizationLetters(authorizationLetterPaths: string[]) {
    for (const path of authorizationLetterPaths) {
      await expect(this.authorizationLetterTexts.filter({ hasText: this.fileName(path) })).toBeVisible();
    }
  }

  fileName(path: string): string {
    return path.substring(path.lastIndexOf('/') + 1);
  }
}
