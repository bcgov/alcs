import { expect, type Locator, type Page } from '@playwright/test';
import { OptionalAttachment } from '../../portal/optional-attachments-page';

export class OptionalDocumentsSection {
  readonly page: Page;
  readonly fileNameTexts: Locator;
  readonly typeTexts: Locator;
  readonly descriptionTexts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileNameTexts = page.getByTestId(`optional-document-file-name`);
    this.typeTexts = page.getByTestId(`optional-document-type`);
    this.descriptionTexts = page.getByTestId(`optional-document-description`);
  }

  async expectAttachments(attachments: OptionalAttachment[]) {
    for (const attachment of attachments) {
      await expect(this.fileNameTexts.filter({ hasText: this.fileName(attachment.path) })).toBeVisible();
      await expect(this.typeTexts.filter({ hasText: attachment.type })).toBeVisible();
      await expect(this.descriptionTexts.filter({ hasText: attachment.description })).toBeVisible();
    }
  }

  fileName(path: string): string {
    return path.substring(path.lastIndexOf('/') + 1);
  }
}
