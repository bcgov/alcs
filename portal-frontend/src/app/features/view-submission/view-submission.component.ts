import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_SOURCE,
  DOCUMENT_TYPE,
} from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../services/application-submission-review/application-submission-review.service';
import {
  APPLICATION_STATUS,
  ApplicationSubmissionDetailedDto,
} from '../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { PdfGenerationService } from '../../services/pdf-generation/pdf-generation.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { MOBILE_BREAKPOINT } from '../../shared/utils/breakpoints';

enum MOBILE_STEP {
  INTRODUCTION = 0,
  APPLICATION = 1,
  LFNG_INFO = 2,
}

@Component({
  selector: 'app-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss'],
})
export class ViewSubmissionComponent implements OnInit, OnDestroy {
  application: ApplicationSubmissionDetailedDto | undefined;
  $application = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
  $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
  applicationReview: ApplicationSubmissionReviewDto | undefined;

  $destroy = new Subject<void>();

  APPLICATION_STATUS = APPLICATION_STATUS;
  resolutionDocument: ApplicationDocumentDto[] = [];
  governmentOtherAttachments: ApplicationDocumentDto[] = [];
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
    private applicationService: ApplicationSubmissionService,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationDocumentService: ApplicationDocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private pdfGenerationService: PdfGenerationService
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
    this.$application.next(this.application);
    this.loadApplicationDocuments(fileId);

    if (
      this.application &&
      [APPLICATION_STATUS.SUBMITTED_TO_ALC, APPLICATION_STATUS.REFUSED_TO_FORWARD].includes(
        this.application.status.code
      ) &&
      this.application.typeCode !== 'TURP'
    ) {
      this.loadApplicationReview(fileId);
    } else {
      this.applicationReview = undefined;
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

  private async loadApplicationDocuments(fileId: string) {
    const documents = await this.applicationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$applicationDocuments.next(documents);
      this.staffReport = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
      this.resolutionDocument = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
      );
      this.governmentOtherAttachments = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.OTHER && document.source === DOCUMENT_SOURCE.LFNG
      );
    }
  }

  async onDownloadSubmissionPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateSubmission(fileNumber);
    }
  }

  async onDownloadReviewPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateReview(fileNumber);
    }
  }
}
