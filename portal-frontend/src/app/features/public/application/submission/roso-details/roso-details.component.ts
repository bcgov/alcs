import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { openFileInline } from '../../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import {
  STRUCTURE_TYPE_LABEL_MAP,
  STRUCTURE_TYPES,
} from '../../../../notice-of-intents/edit-submission/additional-information/additional-information.component';

@Component({
  selector: 'app-roso-details[applicationSubmission]',
  templateUrl: './roso-details.component.html',
  styleUrls: ['./roso-details.component.scss'],
})
export class RosoDetailsComponent {
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherStructureVisible = false;

  _applicationSubmission: PublicApplicationSubmissionDto | undefined;
  @Input() set applicationSubmission(applicationSubmission: PublicApplicationSubmissionDto | undefined) {
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
  get applicationSubmission(): PublicApplicationSubmissionDto {
    return this._applicationSubmission!;
  }

  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  crossSections: PublicDocumentDto[] = [];
  proposalMap: PublicDocumentDto[] = [];
  buildingPlans: PublicDocumentDto[] = [];

  constructor(private router: Router, private publicService: PublicService) {}

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return STRUCTURE_TYPE_LABEL_MAP[value];
  }
}
