import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';
import {
  NoticeOfIntentSubmissionDetailedDto,
  RESIDENTIAL_STRUCTURE_TYPES,
  STRUCTURE_TYPES,
} from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent {
  _noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  @Input() set noiSubmission(noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined) {
    if (noiSubmission) {
      this._noiSubmission = noiSubmission;
      this.setVisibilityAndValidatorsForResidentialFields();
      this.setVisibilityAndValidatorsForAccessoryFields();
      this.setVisibilityAndValidatorsForFarmFields();
      this.setFirstQuestion(noiSubmission);
    }
  }

  @Input() set files(documents: NoticeOfIntentDocumentDto[] | undefined) {
    this.buildingPlans = documents?.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN) ?? [];
  }

  buildingPlans: NoticeOfIntentDocumentDto[] = [];
  firstQuestion: string = '';

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;

  constructor(private router: Router, private noticeOfIntentDocumentService: NoiDocumentService) {}

  private setVisibilityAndValidatorsForResidentialFields() {
    if (
      this._noiSubmission?.soilProposedStructures.some(
        (structure) => structure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structure.type)
      )
    ) {
      this.isSoilStructureResidentialUseReasonVisible = true;
    } else {
      this.isSoilStructureResidentialUseReasonVisible = false;
    }
  }

  private setVisibilityAndValidatorsForAccessoryFields() {
    if (
      this._noiSubmission?.soilProposedStructures.some(
        (structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE
      )
    ) {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = true;
    } else {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = false;
    }
  }

  private setVisibilityAndValidatorsForFarmFields() {
    if (
      this._noiSubmission?.soilProposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE)
    ) {
      this.isSoilAgriParcelActivityVisible = true;
      this.isSoilStructureFarmUseReasonVisible = true;
    } else {
      this.isSoilAgriParcelActivityVisible = false;
      this.isSoilStructureFarmUseReasonVisible = false;
    }
  }
  async openFile(file: NoticeOfIntentDocumentDto) {
    await this.noticeOfIntentDocumentService.download(file.uuid, file.fileName);
  }

  private setFirstQuestion(noiSubmission: NoticeOfIntentSubmissionDetailedDto) {
    switch (noiSubmission.typeCode) {
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
}
