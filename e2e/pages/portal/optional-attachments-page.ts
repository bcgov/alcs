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
  readonly addAttachmentButton: Locator;
  readonly addButton: Locator;
  readonly uploadButton: Locator;
  readonly typeComboboxes: Locator;
  readonly descriptionTextboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addAttachmentButton = page.getByRole('button', {name: 'Add Attachment'});
    this.uploadButton = page.getByRole('button', { name: 'Choose file to Upload', exact: true });
    this.typeComboboxes = page.getByRole('combobox', { name: 'type' });
    this.descriptionTextboxes = page.getByRole('textbox', { name: 'description' });
    this.addButton = page.getByRole('button', {name: 'ADD', exact: true});
  }

  async addAttachments(attachments: OptionalAttachment[]) {
    for (const { path, type, description } of attachments) {
      await this.openUploadAttachmentDialog();
      await this.uploadAttachment(path);
      await this.setLastType(type);
      await this.fillLastDescription(description);
      await this.addAttachment();
    }
  }

  async openUploadAttachmentDialog() {
    await this.addAttachmentButton.click();
    await this.page.waitForSelector('mat-dialog-container', {state: 'visible'});
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

  async addAttachment() {
    await this.addButton.click();
    await this.page.waitForSelector('mat-dialog-container', {state: 'hidden'});
  }
}
