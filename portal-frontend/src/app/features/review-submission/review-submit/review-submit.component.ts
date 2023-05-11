import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionDto } from '../../../services/application-submission/application-submission.dto';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';
import { ReviewApplicationSteps } from '../review-submission.component';

@Component({
  selector: 'app-review-submit[stepper]',
  templateUrl: './review-submit.component.html',
  styleUrls: ['./review-submit.component.scss'],
})
export class ReviewSubmitComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationSubmissionDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() stepper!: CustomStepperComponent;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = ReviewApplicationSteps.ReviewAndSubmit;

  @ViewChild('contactInfo') contactInfoPanel?: MatExpansionPanel;
  @ViewChild('ocpInfo') ocpInfoPanel?: MatExpansionPanel;
  @ViewChild('zoningInfo') zoningPanel?: MatExpansionPanel;
  @ViewChild('authorizationInfo') authorizationInfoPanel?: MatExpansionPanel;
  @ViewChild('attachmentInfo') attachmentInfoPanel?: MatExpansionPanel;

  $destroy = new Subject<void>();
  _applicationReview: ApplicationSubmissionReviewDto | undefined;
  showErrors = true;
  isMobile = false;
  hasCompletedStepsBeforeDocuments = false;

  resolutionDocument: ApplicationDocumentDto[] = [];
  staffReport: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  private fileId: string | undefined;

  constructor(
    private router: Router,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private pdfGenerationService: PdfGenerationService
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

        this.hasCompletedStepsBeforeDocuments =
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
        (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
      );
      this.staffReport = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
      this.otherAttachments = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.OTHER);
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
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
      await this.applicationReviewService.complete(this.fileId);
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private runValidation() {
    if (this._applicationReview) {
      const review = this._applicationReview;
      const contactInfoValid = this.validateContactInfo(review);
      if (!contactInfoValid) {
        if (this.contactInfoPanel) {
          this.contactInfoPanel.open();
        }
      }

      const ocpValid = this.validateOCP(review);
      if (!ocpValid) {
        if (this.ocpInfoPanel) {
          this.ocpInfoPanel.open();
        }
      }

      const zoningValid = this.validateZoning(review);
      if (!zoningValid) {
        if (this.zoningPanel) {
          this.zoningPanel.open();
        }
      }

      const authorizationValid = this.validateAuthorization(review);
      if (!authorizationValid) {
        if (this.authorizationInfoPanel) {
          this.authorizationInfoPanel.open();
        }
      }

      const attachmentsValid = this.validateAttachments(review);
      if (!attachmentsValid) {
        if (this.attachmentInfoPanel) {
          this.attachmentInfoPanel.open();
        }
      }

      const el = document.getElementsByClassName('error');
      if (el && el.length > 0) {
        el[0].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      return contactInfoValid && ocpValid && zoningValid && authorizationValid && attachmentsValid;
    }
    return false;
  }

  private validateContactInfo(review: ApplicationSubmissionReviewDto) {
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

  private validateOCP(review: ApplicationSubmissionReviewDto) {
    if (review.isOCPDesignation) {
      return review.isOCPDesignation
        ? review.OCPBylawName && review.OCPDesignation && review.OCPConsistent !== null
        : true;
    }
    return review.isOCPDesignation !== null;
  }

  private validateZoning(review: ApplicationSubmissionReviewDto) {
    if (review.isSubjectToZoning) {
      return (
        review.isZoningConsistent !== null &&
        review.zoningDesignation &&
        review.zoningMinimumLotSize &&
        review.zoningBylawName
      );
    }
    return review.isSubjectToZoning !== null;
  }

  private validateAuthorization(review: ApplicationSubmissionReviewDto) {
    if (review.isSubjectToZoning === true || review.isOCPDesignation === true) {
      return review.isAuthorized !== null;
    }
    return true;
  }

  private validateAttachments(review: ApplicationSubmissionReviewDto) {
    if (review.isSubjectToZoning === true || review.isOCPDesignation == true) {
      if (review.isAuthorized === true) {
        return this.resolutionDocument.length > 0 && this.staffReport.length > 0;
      } else {
        return this.resolutionDocument.length > 0;
      }
    }
    return true;
  }

  async onNavigateToStep(step: number) {
    await this.router.navigateByUrl(`application/${this.fileId}/review/${step}?errors=t`);
  }

  async onDownloadPdf() {
    if (this.fileId) {
      await this.pdfGenerationService.generateReview(this.fileId);
    }
  }
}
