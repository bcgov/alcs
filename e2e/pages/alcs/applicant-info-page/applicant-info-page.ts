import { type Page } from '@playwright/test';
import { ParcelsSection } from './parcels-section';
import { PrimaryContactSection } from './primary-contact-section';
import { OtherOwnedParcelsSection } from './other-owned-parcels-section';
import { LandUseSection } from './land-use-section';
import { TURProposalSection } from './tur-proposal-section';
import { OptionalDocumentsSection } from './optional-documents-section';

export class ALCSApplicantInfoPage {
  readonly page: Page;
  readonly parcelsSection: ParcelsSection;
  readonly otherOwnedParcelsSection: OtherOwnedParcelsSection;
  readonly primaryContactSection: PrimaryContactSection;
  readonly landUseSection: LandUseSection;
  readonly turProposalSection: TURProposalSection;
  readonly optionalDocumentsSection: OptionalDocumentsSection;

  constructor(page: Page) {
    this.page = page;
    this.parcelsSection = new ParcelsSection(page);
    this.otherOwnedParcelsSection = new OtherOwnedParcelsSection(page);
    this.primaryContactSection = new PrimaryContactSection(page);
    this.landUseSection = new LandUseSection(page);
    this.turProposalSection = new TURProposalSection(page);
    this.optionalDocumentsSection = new OptionalDocumentsSection(page);
  }
}
