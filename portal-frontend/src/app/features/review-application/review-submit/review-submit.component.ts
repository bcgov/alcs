import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

@Component({
  selector: 'app-review-submit[stepper]',
  templateUrl: './review-submit.component.html',
  styleUrls: ['./review-submit.component.scss'],
})
export class ReviewSubmitComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  @Input() stepper!: MatStepper;

  @ViewChild('contactInfo') contactInfoPanel?: MatExpansionPanel;
  @ViewChild('ocpInfo') ocpInfoPanel?: MatExpansionPanel;
  @ViewChild('zoningInfo') zoningPanel?: MatExpansionPanel;
  @ViewChild('authorizationInfo') authorizationInfoPanel?: MatExpansionPanel;
  @ViewChild('attachmentInfo') attachmentInfoPanel?: MatExpansionPanel;

  $destroy = new Subject<void>();
  _applicationReview: ApplicationReviewDto | undefined;
  showErrors = false;
  isMobile = false;

  resolutionDocument: ApplicationDocumentDto[] = [];
  staffReport: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  private fileId: string | undefined;

  constructor(
    private router: Router,
    private applicationReviewService: ApplicationReviewService,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth < 480;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 480;

    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this._applicationReview = applicationReview;
      }
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.resolutionDocument = application.documents.filter(
          (document) => document.type === DOCUMENT.RESOLUTION_DOCUMENT
        );
        this.staffReport = application.documents.filter((document) => document.type === DOCUMENT.STAFF_REPORT);
        this.otherAttachments = application.documents.filter((document) => document.type === DOCUMENT.REVIEW_OTHER);
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

  onEditSection(index: number) {
    this.stepper.selectedIndex = index;
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
    this.showErrors = true;

    const contactInfoValid = this.validateContactInfo();
    if (!contactInfoValid) {
      if (this.contactInfoPanel) {
        this.contactInfoPanel.open();
      }
    }

    const ocpValid = this.validateOCP();
    if (!ocpValid) {
      if (this.ocpInfoPanel) {
        this.ocpInfoPanel.open();
      }
    }

    const zoningValid = this.validateZoning();
    if (!zoningValid) {
      if (this.zoningPanel) {
        this.zoningPanel.open();
      }
    }

    const authorizationValid = this.validateAuthorization();
    if (!authorizationValid) {
      if (this.authorizationInfoPanel) {
        this.authorizationInfoPanel.open();
      }
    }

    const attachmentsValid = this.validateAttachments();
    if (!attachmentsValid) {
      if (this.attachmentInfoPanel) {
        this.attachmentInfoPanel.open();
      }
    }

    const el = document.getElementsByClassName('no-data');
    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    return contactInfoValid && ocpValid && zoningValid && authorizationValid && attachmentsValid;
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

  private validateOCP() {
    if (this._applicationReview) {
      const review = this._applicationReview;
      return review.isOCPDesignation
        ? review.OCPBylawName && review.OCPDesignation && review.isZoningConsistent !== null
        : review.isOCPDesignation !== null;
    }
    return false;
  }

  private validateZoning() {
    if (this._applicationReview) {
      const review = this._applicationReview;
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
    return false;
  }

  private validateAuthorization() {
    if (this._applicationReview) {
      const review = this._applicationReview;
      if (review.isZoningConsistent !== null && review.isOCPDesignation) {
        return this._applicationReview.isAuthorized !== null;
      }
      return true;
    }
    return false;
  }

  private validateAttachments() {
    return this.resolutionDocument.length > 0 && this.staffReport.length > 0;
  }
}
