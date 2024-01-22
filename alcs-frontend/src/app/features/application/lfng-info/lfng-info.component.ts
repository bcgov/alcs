import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import {
  ApplicationReviewDto,
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
} from '../../../services/application/application.dto';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { ReturnApplicationDialogComponent } from './return-application-dialog/return-application-dialog.component';

@Component({
  selector: 'app-lfng-info',
  templateUrl: './lfng-info.component.html',
  styleUrls: ['./lfng-info.component.scss'],
})
export class LfngInfoComponent implements OnInit {
  applicationReview: ApplicationReviewDto | undefined;
  resolutionDocument: ApplicationDocumentDto | undefined;
  staffReport: ApplicationDocumentDto | undefined;
  otherAttachments: ApplicationDocumentDto[] = [];
  submission?: ApplicationSubmissionDto;
  requiresReview = true;
  showComment = false;
  isFirstNationGovernment = false;
  hasCompletedStepsBeforeResolution = false;
  hasCompletedStepsBeforeDocuments = false;
  hasGovernmentReview = false;
  canReturnToGovernment = false;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationReviewService: ApplicationReviewService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe(async (application) => {
      if (application) {
        this.requiresReview = application.type.requiresGovernmentReview;
        this.applicationReview = await this.applicationReviewService.fetchReview(application.fileNumber);
        this.submission = await this.applicationSubmissionService.fetchSubmission(application.fileNumber);
        this.hasGovernmentReview = application.type.requiresGovernmentReview && !!this.applicationReview;
        this.canReturnToGovernment = [
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
        ].includes(this.submission?.status.code);
        this.loadDocuments(application.fileNumber);
        this.isFirstNationGovernment = !!application.localGovernment?.isFirstNation;

        this.hasCompletedStepsBeforeResolution =
          this.isFirstNationGovernment ||
          (!this.isFirstNationGovernment &&
            this.applicationReview.isOCPDesignation !== null &&
            this.applicationReview.isSubjectToZoning !== null &&
            (this.applicationReview.isOCPDesignation === true || this.applicationReview.isSubjectToZoning === true));

        this.hasCompletedStepsBeforeDocuments =
          this.isFirstNationGovernment ||
          (this.applicationReview.isAuthorized !== null &&
            this.applicationReview.isOCPDesignation !== null &&
            this.applicationReview.isSubjectToZoning !== null) ||
          (this.applicationReview.isAuthorized === null &&
            this.applicationReview.isOCPDesignation === false &&
            this.applicationReview.isSubjectToZoning === false);
      }
    });
  }

  async openDocument(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }

  private async loadDocuments(fileNumber: string) {
    const documents = await this.applicationDocumentService.getReviewDocuments(fileNumber);
    this.resolutionDocument = documents.find((doc) => doc.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT);
    this.staffReport = documents.find((doc) => doc.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
    this.otherAttachments = documents.filter((doc) => doc.type?.code === DOCUMENT_TYPE.OTHER);
  }

  async returnToLfng() {
    if (this.submission) {
      this.dialog
        .open(ReturnApplicationDialogComponent, {
          data: {
            fileNumber: this.submission.fileNumber,
          },
        })
        .beforeClosed()
        .subscribe((didUpdate) => {
          if (didUpdate && this.submission) {
            this.applicationDetailService.loadApplication(this.submission?.fileNumber);
          }
        });
    }
  }
}
