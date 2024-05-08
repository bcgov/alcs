import { type Locator, type Page } from '@playwright/test';
import { ParcelsSection } from './parcels-section';
import { PrimaryContactSection } from './primary-contact-section';
import { OtherOwnedParcelsSection } from './other-owned-parcels-section';
import { GovernmentSection } from './government-section';
import { LandUseSection } from './land-use-section';
import { TURProposalSection } from './tur-proposal-section';
import { OptionalDocumentsSection } from './optional-documents-section';

export class ReviewAndSubmitPage {
  readonly page: Page;

  // Locators
  readonly submitButton: Locator;
  readonly informationUseCheckbox: Locator;
  readonly informationCorrectnessCheckbox: Locator;
  readonly acceptVerificationCheckbox: Locator;
  readonly submitDialog: Locator;
  readonly finalSubmitButton: Locator;

  // Sections
  readonly parcelsSection: ParcelsSection;
  readonly otherOwnedParcelsSection: OtherOwnedParcelsSection;
  readonly primaryContactSection: PrimaryContactSection;
  readonly governmentSection: GovernmentSection;
  readonly landUseSection: LandUseSection;
  readonly turProposalSection: TURProposalSection;
  readonly optionalDocumentsSection: OptionalDocumentsSection;

  constructor(page: Page) {
    this.page = page;

    // Locators
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.informationUseCheckbox = page.getByRole('checkbox', {
      name: 'I/we consent to the use of the information provided in the application and all supporting documents to process the application in accordance with the Agricultural Land Commission Act, the Agricultural Land Reserve General Regulation, and the Agricultural Land Reserve Use Regulation.',
    });
    this.informationCorrectnessCheckbox = page.getByRole('checkbox', {
      name: 'I/we declare that the information provided in the application and all the supporting documents are, to the best of my/our knowledge, true and correct.',
    });
    this.acceptVerificationCheckbox = page.getByRole('checkbox', {
      name: 'I/we understand that the Agricultural Land Commission will take the steps necessary to confirm the accuracy of the information and documents provided. This information, excluding phone numbers and emails, will be available for review by any member of the public once received by the ALC.',
    });
    this.submitDialog = page.getByRole('dialog').filter({ hasText: 'Submit Application' });
    this.finalSubmitButton = this.submitDialog.getByRole('button', { name: 'Submit' });

    // Sections
    this.parcelsSection = new ParcelsSection(page);
    this.otherOwnedParcelsSection = new OtherOwnedParcelsSection(page);
    this.primaryContactSection = new PrimaryContactSection(page);
    this.governmentSection = new GovernmentSection(page);
    this.landUseSection = new LandUseSection(page);
    this.turProposalSection = new TURProposalSection(page);
    this.optionalDocumentsSection = new OptionalDocumentsSection(page);
  }

  async submit() {
    await this.submitButton.click();
    await this.informationUseCheckbox.check();
    await this.informationCorrectnessCheckbox.check();
    await this.acceptVerificationCheckbox.check();
    await this.finalSubmitButton.click();
  }
}
