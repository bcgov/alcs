import { expect, type Locator, type Page } from '@playwright/test';
import { TURProposal } from '../../portal/tur-proposal-page';

export class TURProposalSection {
  readonly page: Page;
  readonly purposeText: Locator;
  readonly activitiesText: Locator;
  readonly stepsToReduceImpactText: Locator;
  readonly alternativeLandText: Locator;
  readonly totalAreaText: Locator;
  readonly proofOfServingNoticeText: Locator;
  readonly proposalMapText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.purposeText = page.getByTestId('tur-purpose');
    this.activitiesText = page.getByTestId('tur-agricultural-activities');
    this.stepsToReduceImpactText = page.getByTestId('tur-reduce-negative-impacts');
    this.alternativeLandText = page.getByTestId('tur-outside-lands');
    this.totalAreaText = page.getByTestId('tur-total-corridor-area');
    this.proofOfServingNoticeText = page.getByTestId('tur-proof-of-serving-notice');
    this.proposalMapText = page.getByTestId('tur-proposal-map');
  }

  async expectProposal(proposal: TURProposal) {
    await expect(this.purposeText).toHaveText(proposal.purpose);
    await expect(this.activitiesText).toHaveText(proposal.activities);
    await expect(this.stepsToReduceImpactText).toHaveText(proposal.stepsToReduceImpact);
    await expect(this.alternativeLandText).toHaveText(proposal.alternativeLand);
    await expect(this.totalAreaText).toHaveText(`${proposal.totalArea} ha`);
    
    // ALCS has single links (not mobile/desktop), so use direct toHaveText
    await expect(this.proofOfServingNoticeText).toHaveText(this.fileName(proposal.proofOfServingNoticePath));
    await expect(this.proposalMapText).toHaveText(this.fileName(proposal.proposalMapPath));
  }

  fileName(path: string): string {
    return path.substring(path.lastIndexOf('/') + 1);
  }
}
