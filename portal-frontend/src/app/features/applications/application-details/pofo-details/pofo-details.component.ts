import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import {
  STRUCTURE_TYPE_LABEL_MAP,
  STRUCTURE_TYPES,
} from '../../../notice-of-intents/edit-submission/additional-information/additional-information.component';
import { DocumentService } from '../../../../services/document/document.service';

@Component({
  selector: 'app-pofo-details[applicationSubmission]',
  templateUrl: './pofo-details.component.html',
  styleUrls: ['./pofo-details.component.scss'],
})
export class PofoDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherStructureVisible = false;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;

      this.isSoilStructureFarmUseReasonVisible = applicationSubmission.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE,
      );
      this.isSoilStructureResidentialUseReasonVisible = applicationSubmission.soilProposedStructures.some(
        (structure) =>
          structure.type === STRUCTURE_TYPES.PRINCIPAL_RESIDENCE ||
          structure.type === STRUCTURE_TYPES.ADDITIONAL_RESIDENCE ||
          structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      );
      this.isSoilAgriParcelActivityVisible = applicationSubmission.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE,
      );
      this.isSoilStructureResidentialAccessoryUseReasonVisible = applicationSubmission.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      );
      this.isSoilOtherStructureVisible = applicationSubmission.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.OTHER_STRUCTURE,
      );
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  crossSections: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];
  reclamationPlans: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private documentService: DocumentService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async downloadFile(uuid: string) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

    downloadFile(url, fileName);
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return STRUCTURE_TYPE_LABEL_MAP[value];
  }
}
