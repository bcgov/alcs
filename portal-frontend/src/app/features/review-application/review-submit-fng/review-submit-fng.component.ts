import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';
import { DOCUMENT, ApplicationDocumentDto, ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

@Component({
  selector: 'app-review-submit-fng[stepper]',
  templateUrl: './review-submit-fng.component.html',
  styleUrls: ['./review-submit-fng.component.scss'],
})
export class ReviewSubmitFngComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  @Input() stepper!: MatStepper;

  @ViewChild('contactInfo') contactInfoPanel?: MatExpansionPanel;
  @ViewChild('attachmentInfo') attachmentPanel?: MatExpansionPanel;
  @ViewChild('resolutionInfo') resolutionPanel?: MatExpansionPanel;

  $destroy = new Subject<void>();
  _applicationReview: ApplicationReviewDto | undefined;
  showErrors = false;

  resolutionDocument: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  private fileId: string | undefined;

  constructor(
    private router: Router,
    private applicationReviewService: ApplicationReviewService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
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
    const res = await this.applicationService.openFile(uuid);
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

    const el = document.getElementsByClassName('no-data');
    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

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
}
