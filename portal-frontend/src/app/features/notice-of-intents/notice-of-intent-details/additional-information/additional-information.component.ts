import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import {
  RESIDENTIAL_STRUCTURE_TYPES,
  STRUCTURE_TYPES,
  STRUCTURE_TYPE_LABEL_MAP,
} from '../../edit-submission/additional-information/additional-information.component';
import { downloadFile } from '../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  firstQuestion = 'FIX THIS';

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

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

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

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

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return STRUCTURE_TYPE_LABEL_MAP[value];
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
