import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionDto } from '../../../../services/application-submission/application-submission.dto';
import { CodeService } from '../../../../services/code/code.service';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';
import { CustomStepperComponent } from '../../../../shared/custom-stepper/custom-stepper.component';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { ReviewApplicationFngSteps } from '../review-submission.component';
import { ToastService } from '../../../../services/toast/toast.service';
import { SubmitConfirmationDialogComponent } from '../submit-confirmation-dialog/submit-confirmation-dialog.component';
import { openFileIframe } from '../../../../shared/utils/file';

@Component({
  selector: 'app-review-submit-fng[stepper]',
  templateUrl: './review-submit-fng.component.html',
  styleUrls: ['./review-submit-fng.component.scss'],
})
export class ReviewSubmitFngComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationSubmissionDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() stepper!: CustomStepperComponent;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = ReviewApplicationFngSteps.ReviewAndSubmitFng;

  @ViewChild('contactInfo') contactInfoPanel?: MatExpansionPanel;
  @ViewChild('attachmentInfo') attachmentPanel?: MatExpansionPanel;
  @ViewChild('resolutionInfo') resolutionPanel?: MatExpansionPanel;

  $destroy = new Subject<void>();
  _applicationReview: ApplicationSubmissionReviewDto | undefined;
  showErrors = true;
  isMobile = false;

  resolutionDocument: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  private fileId: string | undefined;
  private localGovernmentUuid = '';

  constructor(
    private router: Router,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private toastService: ToastService,
    private pdfGenerationService: PdfGenerationService,
    private codeService: CodeService,
    private dialog: MatDialog
  ) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this._applicationReview = applicationReview;
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.resolutionDocument = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
      );
      this.otherAttachments = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.OTHER && document.source === DOCUMENT_SOURCE.LFNG
      );
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.localGovernmentUuid = application.localGovernmentUuid;
      }
    });
  }

  async onExit() {
    if (this._applicationReview) {
      await this.router.navigateByUrl(`/application/${this._applicationReview.applicationFileNumber}`);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSubmit() {
    const isValid = this.runValidation();
    if (isValid && this.fileId) {
      const government = await this.loadGovernment(this.localGovernmentUuid);
      const governmentName = government?.name ?? 'selected local / First Nation government';

      this.dialog
        .open(SubmitConfirmationDialogComponent, {
          data: {
            governmentName,
            isAuthorizing: this._applicationReview?.isAuthorized ?? true,
          },
        })
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            const didComplete = await this.applicationReviewService.complete(this.fileId!);
            if (didComplete) {
              await this.router.navigateByUrl(`/application/${this.fileId}/review/success`);
            }
          }
        });
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      openFileIframe(res);
    }
  }

  private runValidation() {
    const contactInfoValid = this.validateContactInfo();
    if (!contactInfoValid) {
      if (this.contactInfoPanel) {
        this.contactInfoPanel.open();
      }
    }

    const resolutionValid = this.validateResolution();
    if (!resolutionValid) {
      if (this.resolutionPanel) {
        this.resolutionPanel.open();
      }
    }

    const attachmentsValid = this.validateAttachments();
    if (!attachmentsValid) {
      if (this.attachmentPanel) {
        this.attachmentPanel.open();
      }
    }

    setTimeout(() => {
      const el = document.getElementsByClassName('error');
      if (el && el.length > 0) {
        el[0].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        this.toastService.showErrorToast('Please correct all errors before submitting the form');
      }
    }, 5);

    return contactInfoValid && resolutionValid && attachmentsValid;
  }

  private validateContactInfo() {
    if (this._applicationReview) {
      const review = this._applicationReview;
      return (
        review.localGovernmentFileNumber &&
        review.firstName &&
        review.lastName &&
        review.position &&
        review.department &&
        review.position &&
        review.email
      );
    }
    return false;
  }

  private validateResolution() {
    if (this._applicationReview) {
      return this._applicationReview.isAuthorized !== null;
    }
    return false;
  }

  private validateAttachments() {
    return this.resolutionDocument.length > 0;
  }

  async onNavigateToStep(step: number) {
    await this.router.navigateByUrl(`application/${this.fileId}/review/${step}?errors=t`);
  }

  async onDownloadPdf() {
    if (this.fileId) {
      await this.pdfGenerationService.generateReview(this.fileId);
    }
  }

  private async loadGovernment(uuid: string) {
    const codes = await this.codeService.loadCodes();
    const localGovernment = codes.localGovernments.find((a) => a.uuid === uuid);
    if (localGovernment) {
      return localGovernment;
    }
    return;
  }
}
