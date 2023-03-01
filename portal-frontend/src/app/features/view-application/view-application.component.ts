import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationReviewDto } from '../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { APPLICATION_STATUS, ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { MOBILE_BREAKPOINT } from '../../shared/utils/breakpoints';

enum MOBILE_STEP {
  INTRODUCTION = 0,
  APPLICATION = 1,
  LFNG_INFO = 2,
}

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrls: ['./view-application.component.scss'],
})
export class ViewApplicationComponent implements OnInit, OnDestroy {
  application: ApplicationDto | undefined;
  applicationReview: ApplicationReviewDto | undefined;

  $destroy = new Subject<void>();

  APPLICATION_STATUS = APPLICATION_STATUS;
  resolutionDocument: ApplicationDocumentDto[] = [];
  otherAttachments: ApplicationDocumentDto[] = [];
  staffReport: ApplicationDocumentDto[] = [];
  isMobile = false;
  mobileStep = MOBILE_STEP.INTRODUCTION;
  selectedStep: MOBILE_STEP | undefined;
  MOBILE_STEP = MOBILE_STEP;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationDocumentService: ApplicationDocumentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  onChangeMobileStep() {
    if (this.selectedStep) {
      this.mobileStep = this.selectedStep;
    }
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });

    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((appReview) => {
      this.applicationReview = appReview;
    });
  }

  async loadApplication(fileId: string) {
    this.application = await this.applicationService.getByFileId(fileId);

    if (this.application && this.application.status.code === APPLICATION_STATUS.SUBMITTED_TO_ALC) {
      this.loadApplicationReview(fileId);
      this.staffReport = this.application.documents.filter((document) => document.type === DOCUMENT.STAFF_REPORT);
      this.resolutionDocument = this.application.documents.filter(
        (document) => document.type === DOCUMENT.RESOLUTION_DOCUMENT
      );
      this.otherAttachments = this.application.documents.filter((document) => document.type === DOCUMENT.REVIEW_OTHER);
    }
  }

  onCancel(fileId: string) {
    const dialog = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to cancel your application? A cancelled application cannot be edited or submitted to the ALC. This cannot be undone.',
      confirmAction: 'Confirm',
      cancelAction: 'Return',
    });

    dialog.subscribe(async (isConfirmed) => {
      if (isConfirmed) {
        await this.applicationService.cancel(fileId);
      }
    });
  }

  async onReview(fileId: string) {
    if (this.application?.status.code === APPLICATION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (!review) {
        return;
      }
    }
    await this.router.navigateByUrl(`application/${fileId}/review`);
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

  private loadApplicationReview(fileId: string) {
    this.applicationReviewService.getByFileId(fileId);
  }

  onNavigateHome() {
    this.router.navigateByUrl(`home`);
  }
}
