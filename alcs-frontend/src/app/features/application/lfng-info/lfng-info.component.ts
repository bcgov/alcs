import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../services/application/application-document/application-document.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import {
  ApplicationReviewDto,
  ApplicationSubmissionDto,
  SUBMISSION_STATUS,
} from '../../../services/application/application.dto';
import { ApplicationSubmissionService } from '../../../services/application/application-submission/application-submission.service';

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

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationReviewService: ApplicationReviewService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe(async (application) => {
      if (application) {
        this.requiresReview = application.type.code !== 'TURP';
        this.applicationReview = await this.applicationReviewService.fetchReview(application.fileNumber);
        this.submission = await this.applicationSubmissionService.fetchSubmission(application.fileNumber);
        this.showComment = [SUBMISSION_STATUS.WRONG_GOV, SUBMISSION_STATUS.INCOMPLETE].includes(
          this.submission?.status.code
        );
        this.loadDocuments(application.fileNumber);
        this.isFirstNationGovernment = !!application.localGovernment?.isFirstNation;

        this.hasCompletedStepsBeforeResolution =
          this.isFirstNationGovernment ||
          (!this.isFirstNationGovernment &&
            this.applicationReview.isOCPDesignation !== null &&
            this.applicationReview.isSubjectToZoning !== null &&
            (this.applicationReview.isOCPDesignation === true || this.applicationReview.isSubjectToZoning === true));

        this.hasCompletedStepsBeforeDocuments =
          (this.applicationReview.isAuthorized !== null && this.isFirstNationGovernment) ||
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
}
