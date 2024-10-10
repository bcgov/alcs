import { Component, Input, OnInit } from '@angular/core';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { openFileInline } from '../../../../../shared/utils/file';
import {
  RESIDENTIAL_STRUCTURE_TYPES,
  STRUCTURE_TYPES,
  NOI_STRUCTURE_TYPE_LABEL_MAP,
} from '../../../../notice-of-intents/edit-submission/additional-information/additional-information.component';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent implements OnInit {
  firstQuestion = 'FIX THIS';

  @Input() noiSubmission!: PublicNoticeOfIntentSubmissionDto;

  @Input() set noiDocuments(documents: PublicDocumentDto[]) {
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  buildingPlans: PublicDocumentDto[] = [];

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherStructureVisible = false;

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    this.setVisibilityForResidentialFields();
    this.setValidatorsForAccessoryFields();
    this.setVisibilityForFarmFields();
    this.setVisibilityForOtherFields();

    switch (this.noiSubmission.typeCode) {
      case 'ROSO':
        this.firstQuestion = 'Are you placing fill in order to build a structure?';
        break;
      case 'POFO':
        this.firstQuestion = 'Are you placing fill in order to build a structure?';
        break;
      case 'PFRS':
        this.firstQuestion = 'Are you removing soil and placing fill in order to build a structure?';
        break;
    }
  }

  private setVisibilityForResidentialFields() {
    this.isSoilStructureResidentialUseReasonVisible = !!this.noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structure.type),
    );
  }

  private setValidatorsForAccessoryFields() {
    this.isSoilStructureResidentialAccessoryUseReasonVisible = !!this.noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
    );
  }

  private setVisibilityForFarmFields() {
    if (
      this.noiSubmission?.soilProposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE)
    ) {
      this.isSoilAgriParcelActivityVisible = true;
      this.isSoilStructureFarmUseReasonVisible = true;
    } else {
      this.isSoilAgriParcelActivityVisible = false;
      this.isSoilStructureFarmUseReasonVisible = false;
    }
  }

  private setVisibilityForOtherFields() {
    this.isSoilOtherStructureVisible = !!this.noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type === STRUCTURE_TYPES.OTHER_STRUCTURE,
    );
  }

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getNoticeOfIntentOpenFileUrl(this.noiSubmission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return NOI_STRUCTURE_TYPE_LABEL_MAP[value];
  }
}
