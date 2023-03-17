import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { ReviewApplicationFngSteps, ReviewApplicationSteps } from '../review-application.component';

@Component({
  selector: 'app-review-attachments',
  templateUrl: './review-attachments.component.html',
  styleUrls: ['./review-attachments.component.scss'],
})
export class ReviewAttachmentsComponent implements OnInit, OnDestroy {
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep: ReviewApplicationSteps | ReviewApplicationFngSteps = ReviewApplicationSteps.Attachments;
  @Input() showErrors = false;

  $destroy = new Subject<void>();

  documentTypes = DOCUMENT;

  private fileId: string | undefined;
  resolutionDocument: ApplicationDocumentDto[] = [];
  staffReport: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  isFirstNationGovernment = false;
  isAuthorized = false;
  showMandatoryUploads = false;
  hasCompletedPreviousSteps = false;

  constructor(
    private router: Router,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;
        this.isFirstNationGovernment = applicationReview.isFirstNationGovernment;
        if (this.isFirstNationGovernment) {
          this.currentStep = ReviewApplicationFngSteps.Attachments;
        }

        this.showMandatoryUploads =
          applicationReview.isSubjectToZoning === true ||
          applicationReview.isOCPDesignation === true ||
          applicationReview.isFirstNationGovernment;
        this.isAuthorized = applicationReview.isAuthorized === true;
        this.hasCompletedPreviousSteps =
          applicationReview.isFirstNationGovernment ||
          (applicationReview.isAuthorized !== null &&
            applicationReview.isOCPDesignation !== null &&
            applicationReview.isSubjectToZoning !== null) ||
          (applicationReview.isAuthorized === null &&
            applicationReview.isOCPDesignation === false &&
            applicationReview.isSubjectToZoning === false);
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.resolutionDocument = documents.filter((document) => document.type === DOCUMENT.RESOLUTION_DOCUMENT);
      this.staffReport = documents.filter((document) => document.type === DOCUMENT.STAFF_REPORT);
      this.otherAttachments = documents.filter((document) => document.type === DOCUMENT.REVIEW_OTHER);
    });
  }

  async onExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async loadApplicationDocuments(fileId: string) {
    const documents = await this.applicationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$applicationDocuments.next(documents);
    }
  }

  async attachFile(fileHandle: FileHandle, documentType: DOCUMENT) {
    if (this.fileId) {
      await this.applicationDocumentService.attachExternalFile(
        this.fileId,
        fileHandle.file,
        documentType,
        'Local Government'
      );
      await this.loadApplicationDocuments(this.fileId);
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.applicationDocumentService.deleteExternalFile($event.uuid);
      await this.loadApplicationDocuments(this.fileId);
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
