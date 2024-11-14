import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';
import { STRUCTURE_TYPES } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { STRUCTURE_TYPE_LABEL_MAP } from '../../../../notice-of-intent/applicant-info/notice-of-intent-details/additional-information/additional-information.component';

@Component({
  selector: 'app-pofo-details[applicationSubmission]',
  templateUrl: './pofo-details.component.html',
  styleUrls: ['./pofo-details.component.scss'],
})
export class PofoDetailsComponent {
  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherStructureVisible = false;

  _applicationSubmission: ApplicationSubmissionDto | undefined;
  @Input() set applicationSubmission(application: ApplicationSubmissionDto | undefined) {
    if (application) {
      this._applicationSubmission = application;

      this.isSoilStructureFarmUseReasonVisible = application.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE,
      );
      this.isSoilStructureResidentialUseReasonVisible = application.soilProposedStructures.some(
        (structure) =>
          structure.type === STRUCTURE_TYPES.PRINCIPAL_RESIDENCE ||
          structure.type === STRUCTURE_TYPES.ADDITIONAL_RESIDENCE ||
          structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      );
      this.isSoilAgriParcelActivityVisible = application.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE,
      );
      this.isSoilStructureResidentialAccessoryUseReasonVisible = application.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      );
      this.isSoilOtherStructureVisible = application.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.OTHER,
      );
    }
  }

  @Input() set files(documents: ApplicationDocumentDto[] | undefined) {
    if (documents) {
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    }
  }

  crossSections: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];
  reclamationPlans: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return STRUCTURE_TYPE_LABEL_MAP[value];
  }
}
