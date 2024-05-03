import { expect, type Locator, type Page } from '@playwright/test';

export enum SubmissionType {
  Application = 'Application',
  NoticeOfIntent = 'Notice of Intent',
  SRW = 'Notification of Statutory Right of Way (SRW)',
}

export enum ApplicationType {
  Inclusion = 'Include Land into the ALR',
  NARU = 'Non-Adhering Residential Use within the ALR',
  POFO = 'Placement of Fill within the ALR',
  PFRS = 'Removal of Soil (Extraction) and Placement of Fill within the ALR',
  ROSO = 'Removal of Soil (Extraction) within the ALR',
  NFU = 'Non-Farm Uses within the ALR',
  Subdivision = 'Subdivide Land in the ALR',
  TUR = 'Transportation, Utility, or Recreational Trail Uses within the ALR',
  Exclusion = 'Exclude Land from the ALR',
  Covenant = 'Register a Restrictive Covenant within the ALR',
}

export class InboxPage {
  readonly page: Page;
  readonly startCreateButton: Locator;
  readonly nextButton: Locator;
  readonly finishCreateButton: Locator;
  readonly createNewDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startCreateButton = page.getByRole('button', { name: '+ Create New' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.finishCreateButton = page.getByRole('button', { name: 'create' });
    this.createNewDialog = page.getByRole('dialog', { name: 'Create New' });
  }

  async createApplication(type: ApplicationType) {
    await this.startCreateButton.click();
    await this.setSubmissionType(SubmissionType.Application);
    await this.nextButton.click();
    await this.setApplicationType(type);
    await this.finishCreateButton.click();
    await expect(this.createNewDialog).toBeHidden();
  }

  async setSubmissionType(type: SubmissionType) {
    await this.page.getByRole('radio', { name: type }).check();
  }

  async setApplicationType(type: ApplicationType) {
    await this.page.getByRole('radio', { name: type }).click();
  }
}
