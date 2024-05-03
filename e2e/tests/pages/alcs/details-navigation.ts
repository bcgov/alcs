import { type Locator, type Page } from '@playwright/test';

export class ALCSDetailsNavigation {
  readonly page: Page;
  readonly applicantInfoLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.applicantInfoLink = page.getByText('Applicant Info');
  }

  async gotoApplicantInfoPage() {
    await this.applicantInfoLink.click();
  }
}
