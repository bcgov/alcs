import { type Locator, type Page } from '@playwright/test';

export enum OptionalAttachmentType {
  SitePhoto = 'Site Photo',
  ProfessionalReport = 'Professional Report',
  Other = 'Other',
}

export interface OptionalAttachment {
  path: string;
  type: OptionalAttachmentType;
  description: string;
}

export class OptionalAttachmentsPage {
  readonly page: Page;
  readonly uploadButton: Locator;
  readonly typeComboboxes: Locator;
  readonly descriptionTextboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadButton = page.getByRole('button', { name: 'Choose file to Upload', exact: true });
    this.typeComboboxes = page.getByRole('combobox', { name: 'type' });
    this.descriptionTextboxes = page.getByRole('textbox', { name: 'description' });
  }

  async addAttachments(attachments: OptionalAttachment[]) {
    for (const { path, type, description } of attachments) {
      await this.uploadAttachment(path);
      await this.setLastType(type);
      await this.fillLastDescription(description);
    }
  }

  async uploadAttachment(path: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }

  async setLastType(type: OptionalAttachmentType) {
    await this.typeComboboxes.last().click();
    await this.page.getByText(type).click();
  }

  async fillLastDescription(description: string) {
    await this.descriptionTextboxes.last().fill(description);
  }
}
