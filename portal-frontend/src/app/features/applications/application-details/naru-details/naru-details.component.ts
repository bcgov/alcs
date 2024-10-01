import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { openFileInline } from '../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';

@Component({
  selector: 'app-naru-details[applicationSubmission]',
  templateUrl: './naru-details.component.html',
  styleUrls: ['./naru-details.component.scss'],
})
export class NaruDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  proposalMap: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationDocumentService: ApplicationDocumentService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`,
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.applicationDocumentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
