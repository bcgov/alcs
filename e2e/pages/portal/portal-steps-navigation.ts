import { type Locator, type Page } from '@playwright/test';

export class PortalStepsNavigation {
  readonly page: Page;
  readonly parcelsPageLink: Locator;
  readonly otherParcelsPageLink: Locator;
  readonly primaryContactPageLink: Locator;
  readonly governmentPageLink: Locator;
  readonly landUsePageLink: Locator;
  readonly proposalPageLink: Locator;
  readonly optionalAttachmentsPageLink: Locator;
  readonly reviewAndSubmitPageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.parcelsPageLink = page.getByTestId('steps').getByText('Parcel Details');
    this.otherParcelsPageLink = page.getByTestId('steps').getByText('Other Owned Parcels');
    this.primaryContactPageLink = page.getByTestId('steps').getByText('Primary Contact');
    this.governmentPageLink = page.getByTestId('steps').getByText('Government');
    this.landUsePageLink = page.getByTestId('steps').getByText('Land Use');
    this.proposalPageLink = page.getByTestId('steps').getByText('Proposal');
    this.optionalAttachmentsPageLink = page.getByTestId('steps').getByText('Upload Attachments');
    this.reviewAndSubmitPageLink = page.getByTestId('steps').getByText('Review & Submit');
  }

  async gotoParcelsPage() {
    await this.parcelsPageLink.click();
  }

  async gotoOtherParcelsPage() {
    await this.otherParcelsPageLink.click();
  }

  async gotoPrimaryContactPage() {
    await this.primaryContactPageLink.click();
  }

  async gotoGovernmentPage() {
    await this.governmentPageLink.click();
  }

  async gotoLandUsePage() {
    await this.landUsePageLink.click();
  }

  async gotoProposalPage() {
    await this.proposalPageLink.click();
  }

  async gotoOptionalAttachmentsPage() {
    await this.optionalAttachmentsPageLink.click();
  }

  async gotoReviewAndSubmitPage() {
    await this.reviewAndSubmitPageLink.click();
  }
}
