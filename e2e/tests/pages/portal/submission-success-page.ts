import { expect, type Locator, type Page } from '@playwright/test';

export class SubmissionSuccessPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Application ID' });
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
}
