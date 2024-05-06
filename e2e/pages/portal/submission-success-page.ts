import { expect, type Locator, type Page } from '@playwright/test';

export enum ApplicationStatus {
  UnderReviewByALC = 'Under Review by ALC',
  ReceivedByALC = 'Received By ALC',
  SubmittedToALCIncomplete = 'Submitted to ALC - Incomplete',
  SubmittedToALC = 'Submitted to ALC',
  UnderReviewByLFNG = 'Under Review by L/FNG',
  SubmittedToLFNG = 'Submitted to L/FNG',
  InProgress = 'In Progress',
  LFNGReturnedAsIncomplete = 'L/FNG Returned as Incomplete',
  WrongLFNG = 'Wrong L/FNG',
  ALCReturnedToLFNG = 'ALC Returned to L/FNG',
  Cancelled = 'Cancelled',
  LFNGRefusedToForward = 'L/FNG Refused to Forward',
  DecisionReleased = 'Decision Released',
}

export class SubmissionSuccessPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly viewSubmissionButton: Locator;
  readonly applicationStatusText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Application ID' });
    this.viewSubmissionButton = page.getByRole('button', { name: 'view submission' });
    this.applicationStatusText = page.getByTestId('application-status');
  }

  async fileId(): Promise<string> {
    const headingText = await this.heading.textContent();

    await expect(headingText).not.toBeNull();

    const matches = headingText!.match(/(?<=Application ID: )\d*/);

    await expect(matches).not.toBeNull();

    const fileId: string = matches![0];

    // Should never return empty string, but necessary to appease TypeScript
    return fileId;
  }

  async viewSubmission() {
    await this.viewSubmissionButton.click();
  }

  async expectApplicationStatus(status: ApplicationStatus) {
    await expect(this.applicationStatusText).toHaveText(status);
  }
}
