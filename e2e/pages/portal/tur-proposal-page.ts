import { type Locator, type Page } from '@playwright/test';

export interface TURProposal {
  purpose: string;
  activities: string;
  stepsToReduceImpact: string;
  alternativeLand: string;
  totalArea: string;
  isConfirmed: boolean;
  proofOfServingNoticePath: string;
  proposalMapPath: string;
}

export class TURProposalPage {
  readonly page: Page;
  readonly purposeTextbox: Locator;
  readonly activitiesTextbox: Locator;
  readonly stepsToReduceImpactTextbox: Locator;
  readonly alternativeLandTextbox: Locator;
  readonly totalAreaTextbox: Locator;
  readonly confirmationCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.purposeTextbox = page.getByLabel('What is the purpose of the proposal?');
    this.activitiesTextbox = page.getByLabel(
      'Specify any agricultural activities such as livestock operations, greenhouses or horticultural activities in proximity to the proposal.',
    );
    this.stepsToReduceImpactTextbox = page.getByLabel(
      'What steps will you take to reduce potential negative impacts on surrounding agricultural lands?',
    );
    this.alternativeLandTextbox = page.getByLabel('Could this proposal be accommodated on lands outside of the ALR?');
    this.totalAreaTextbox = page.getByPlaceholder('Type total area');
    this.confirmationCheckbox = page.getByText(
      'I confirm that all affected property owners with land in the ALR have been notif',
    );
  }

  async fill(proposal: TURProposal) {
    await this.purposeTextbox.fill(proposal.purpose);
    await this.activitiesTextbox.fill(proposal.activities);
    await this.stepsToReduceImpactTextbox.fill(proposal.stepsToReduceImpact);
    await this.alternativeLandTextbox.fill(proposal.alternativeLand);
    await this.totalAreaTextbox.fill(proposal.totalArea);
    if (proposal.isConfirmed) {
      await this.confirmationCheckbox.check();
    }
    await this.uploadProofOfServingNotice(proposal.proofOfServingNoticePath);
    await this.uploadProposalMap(proposal.proposalMapPath);
  }

  async uploadProofOfServingNotice(path: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByTestId('proof-of-serving-notice-filechooser').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }

  async uploadProposalMap(path: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByTestId('proposal-map-filechooser').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }
}
