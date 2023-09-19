import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import {
  RESIDENTIAL_STRUCTURE_TYPES,
  STRUCTURE_TYPES,
} from '../../edit-submission/additional-information/additional-information.component';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() updatedFields: string[] = [];

  firstQuestion = 'FIX THIS';

  _noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  @Input() set noiSubmission(noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined) {
    if (noiSubmission) {
      this._noiSubmission = noiSubmission;
      this.setVisibilityForResidentialFields();
      this.setValidatorsForAccessoryFields();
      this.setVisibilityForFarmFields();
      this.setVisibilityForOtherFields();

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

  @Input() set noiDocuments(documents: NoticeOfIntentDocumentDto[]) {
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  buildingPlans: NoticeOfIntentDocumentDto[] = [];

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherStructureVisible = false;

  constructor(private router: Router, private noticeOfIntentDocumentService: NoticeOfIntentDocumentService) {}

  private setVisibilityForResidentialFields() {
    this.isSoilStructureResidentialUseReasonVisible = !!this._noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structure.type)
    );
  }

  private setValidatorsForAccessoryFields() {
    this.isSoilStructureResidentialAccessoryUseReasonVisible = !!this._noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE
    );
  }

  private setVisibilityForFarmFields() {
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

  private setVisibilityForOtherFields() {
    this.isSoilOtherStructureVisible = !!this._noiSubmission?.soilProposedStructures.some(
      (structure) => structure.type === STRUCTURE_TYPES.OTHER_STRUCTURE
    );
  }

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/notice-of-intent/${this._noiSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`notice-of-intent/${this._noiSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async openFile(uuid: string) {
    const res = await this.noticeOfIntentDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }
}
