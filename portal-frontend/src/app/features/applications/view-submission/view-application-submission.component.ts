import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import {
  ApplicationSubmissionDetailedDto,
  SUBMISSION_STATUS,
} from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { openFileInline } from '../../../shared/utils/file';

@Component({
  selector: 'app-view-application-submission',
  templateUrl: './view-application-submission.component.html',
  styleUrls: ['./view-application-submission.component.scss'],
})
export class ViewApplicationSubmissionComponent implements OnInit, OnDestroy {
  application: ApplicationSubmissionDetailedDto | undefined;
  $application = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
  $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
  applicationReview: ApplicationSubmissionReviewDto | undefined;
  selectedIndex = 0;

  $destroy = new Subject<void>();
  isLoading = false;

  SUBMISSION_STATUS = SUBMISSION_STATUS;

  constructor(
    private applicationService: ApplicationSubmissionService,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationDocumentService: ApplicationDocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private pdfGenerationService: PdfGenerationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });
  }

  async loadApplication(fileId: string) {
    this.application = await this.applicationService.getByFileId(fileId);
    this.$application.next(this.application);

    if (this.application?.status.code === SUBMISSION_STATUS.ALC_DECISION) {
      this.selectedIndex = 2;
    } else if (this.application?.status.code === SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG) {
      this.selectedIndex = 1;
    }
    this.loadApplicationDocuments(fileId);
  }

  onCancel(fileId: string) {
    const dialog = this.confirmationDialogService.openDialog({
      title: 'Cancel Application',
      body: 'Are you sure you want to cancel the application? A cancelled application cannot be edited or submitted to the ALC. This cannot be undone.',
      confirmAction: 'Confirm',
      cancelAction: 'Return',
    });

    dialog.subscribe(async (isConfirmed) => {
      if (isConfirmed) {
        await this.applicationService.cancel(fileId);
        await this.router.navigateByUrl(`/home`);
      }
    });
  }

  onCancelWrapper(event: any) {
    this.onCancel(event);
  }

  async onReview(fileId: string) {
    this.isLoading = true;
    if (this.application?.status.code === SUBMISSION_STATUS.SUBMITTED_TO_LG) {
      const review = await this.applicationReviewService.startReview(fileId);
      if (!review) {
        return;
      }
    }
    await this.router.navigateByUrl(`application/${fileId}/review`);
    this.isLoading = false;
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

  async onNavigateHome() {
    await this.router.navigateByUrl(`home/applications`);
  }

  private async loadApplicationDocuments(fileId: string) {
    const documents = await this.applicationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$applicationDocuments.next(documents);
    }
  }

  async onDownloadSubmissionPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateAppSubmission(fileNumber);
    }
  }
}
