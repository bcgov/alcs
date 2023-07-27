import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_SOURCE,
  DOCUMENT_TYPE,
} from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import {
  ApplicationSubmissionDetailedDto,
  SUBMISSION_STATUS,
} from '../../../services/application-submission/application-submission.dto';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';

@Component({
  selector: 'app-lfng-review',
  templateUrl: './lfng-review.component.html',
  styleUrls: ['./lfng-review.component.scss'],
})
export class LfngReviewComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  @Input() $application = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
  @Input() $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  @Output() onCancel = new EventEmitter<string>();

  application: ApplicationSubmissionDetailedDto | undefined;
  applicationReview: ApplicationSubmissionReviewDto | undefined;
  SUBMISSION_STATUS = SUBMISSION_STATUS;
  staffReport: ApplicationDocumentDto[] = [];
  resolutionDocument: ApplicationDocumentDto[] = [];
  governmentOtherAttachments: ApplicationDocumentDto[] = [];
  hasCompletedStepsBeforeResolution = false;
  hasCompletedStepsBeforeDocuments = false;
  submittedToAlcStatus = false;

  constructor(
    private applicationReviewService: ApplicationSubmissionReviewService,
    private pdfGenerationService: PdfGenerationService,
    private applicationDocumentService: ApplicationDocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((appReview) => {
      if (appReview) {
        this.applicationReview = appReview;

        this.hasCompletedStepsBeforeResolution =
          appReview.isFirstNationGovernment ||
          (!appReview.isFirstNationGovernment &&
            appReview.isOCPDesignation !== null &&
            appReview.isSubjectToZoning !== null &&
            (appReview.isOCPDesignation === true || appReview.isSubjectToZoning === true));

        this.hasCompletedStepsBeforeDocuments =
          (appReview.isAuthorized !== null && appReview.isFirstNationGovernment) ||
          (appReview.isAuthorized !== null &&
            appReview.isOCPDesignation !== null &&
            appReview.isSubjectToZoning !== null) ||
          (appReview.isAuthorized === null &&
            appReview.isOCPDesignation === false &&
            appReview.isSubjectToZoning === false);
      }
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
      this.submittedToAlcStatus = !!this.application?.submissionStatuses.find(
        (s) => s.statusTypeCode === SUBMISSION_STATUS.SUBMITTED_TO_ALC && !!s.effectiveDate
      );
      this.loadReview();
    });

    this.$applicationDocuments.subscribe((documents) => {
      this.staffReport = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
      this.resolutionDocument = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
      );
      this.governmentOtherAttachments = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.OTHER && document.source === DOCUMENT_SOURCE.LFNG
      );
    });
  }

  async onDownloadReviewPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateReview(fileNumber);
    }
  }

  async loadReview() {
    if (
      this.application &&
      this.application.typeCode !== 'TURP' &&
      (this.submittedToAlcStatus ||
        (this.application.status.code === SUBMISSION_STATUS.IN_REVIEW_BY_LG && this.application.canReview))
    ) {
      await this.applicationReviewService.getByFileId(this.application.fileNumber);
    } else {
      this.applicationReview = undefined;
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  async onReview(fileId: string) {
    if (this.application?.status.code === SUBMISSION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (!review) {
        return;
      }
    }
    await this.router.navigateByUrl(`application/${fileId}/review`);
  }

  onCancelClicked(fileNumber: string) {
    this.onCancel.emit(fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
