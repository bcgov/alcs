import { expect, type Locator, type Page } from '@playwright/test';

export class ALCSDocumentsPage {
  readonly page: Page;
  readonly submissionOriginalPdfTableCells: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submissionOriginalPdfTableCells = page.getByRole('row').filter({ hasText: 'SUBORIG' }).getByRole('cell');
  }

  async expectSubmissionOriginalPdfInTable(fileId: string) {
    const cellTexts = ['SUBORIG', `${fileId}_APP_Submission.pdf`, 'Applicant - Portal', 'A , C* , G'];

    for (const cellText of cellTexts) {
      await expect(this.submissionOriginalPdfTableCells.filter({ hasText: cellText })).toBeVisible();
    }
  }
}
