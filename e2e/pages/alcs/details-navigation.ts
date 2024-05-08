import { type Locator, type Page } from '@playwright/test';

export class ALCSDetailsNavigation {
  readonly page: Page;
  readonly navLinks: Locator;
  readonly applicantInfoLink: Locator;
  readonly documentsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navLinks = page.getByTestId('details-nav-link');
    this.applicantInfoLink = this.navLinks.filter({ hasText: 'Applicant Info' });
    this.documentsLink = this.navLinks.filter({ hasText: 'Documents' });
  }

  async gotoApplicantInfoPage() {
    await this.applicantInfoLink.click();
  }

  async gotoDocumentsPage() {
    await this.documentsLink.click();
  }
}
