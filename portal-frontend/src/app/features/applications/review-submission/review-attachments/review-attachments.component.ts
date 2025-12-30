import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { ReviewApplicationFngSteps, ReviewApplicationSteps } from '../review-submission.component';
import { openFileInline } from '../../../../shared/utils/file';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-review-attachments',
    templateUrl: './review-attachments.component.html',
    styleUrls: ['./review-attachments.component.scss'],
    standalone: false
})
export class ReviewAttachmentsComponent implements OnInit, OnDestroy {
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep: ReviewApplicationSteps | ReviewApplicationFngSteps = ReviewApplicationSteps.Attachments;
  @Input() showErrors = false;

  $destroy = new Subject<void>();

  documentTypes = DOCUMENT_TYPE;

  private fileId: string | undefined;
  resolutionDocument: ApplicationDocumentDto[] = [];
  staffReport: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  isFirstNationGovernment = false;
  isAuthorized = false;
  showMandatoryUploads = false;
  hasCompletedPreviousSteps = false;

  showResolutionHasVirusError = false;
  showResolutionVirusScanFailedError = false;
  showStaffReportHasVirusError = false;
  showStaffReportVirusScanFailedError = false;
  showOtherHasVirusError = false;
  showOtherVirusScanFailedError = false;

  constructor(
    private applicationReviewService: ApplicationSubmissionReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private toastService: ToastService,
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
      this.resolutionDocument = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
      );
      this.staffReport = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
      this.otherAttachments = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.OTHER && document.source === DOCUMENT_SOURCE.LFNG,
      );
    });
  }

  async loadApplicationDocuments(fileId: string) {
    const documents = await this.applicationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$applicationDocuments.next(documents);
    }
  }

  async attachStaffReport(fileHandle: FileHandle) {
    try {
      await this.attachFile(fileHandle, DOCUMENT_TYPE.STAFF_REPORT);
      this.showStaffReportHasVirusError = false;
      this.showStaffReportVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showStaffReportHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showStaffReportVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachResolutionDocument(fileHandle: FileHandle) {
    try {
      await this.attachFile(fileHandle, DOCUMENT_TYPE.RESOLUTION_DOCUMENT);
      this.showResolutionHasVirusError = false;
      this.showResolutionVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showResolutionHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showResolutionVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachOtherDocument(fileHandle: FileHandle) {
    try {
      await this.attachFile(fileHandle, DOCUMENT_TYPE.OTHER);
      this.showOtherHasVirusError = false;
      this.showOtherVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showOtherHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showOtherVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  private async attachFile(fileHandle: FileHandle, documentType: DOCUMENT_TYPE) {
    if (this.fileId) {
      try {
        await this.applicationDocumentService.attachExternalFile(
          this.fileId,
          fileHandle.file,
          documentType,
          DOCUMENT_SOURCE.LFNG,
        );
        this.toastService.showSuccessToast('Document uploaded');
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');

        throw err;
      }
      await this.loadApplicationDocuments(this.fileId);
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.applicationDocumentService.deleteExternalFile($event.uuid);
      await this.loadApplicationDocuments(this.fileId);
    }
  }

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.applicationDocumentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
