import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
} from '../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-view-notification-submission',
  templateUrl: './view-notification-submission.component.html',
  styleUrls: ['./view-notification-submission.component.scss'],
})
export class ViewNotificationSubmissionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
  $notificationDocuments = new BehaviorSubject<NotificationDocumentDto[]>([]);
  submission: NotificationSubmissionDetailedDto | undefined;

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationDocumentService: NotificationDocumentService,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.loadSubmission(fileId);
        this.loadDocuments(fileId);
      }
    });
  }

  async loadSubmission(fileId: string) {
    const notificationSubmission = await this.notificationSubmissionService.getByFileId(fileId);
    this.submission = notificationSubmission;
    this.$notificationSubmission.next(notificationSubmission);
  }

  async loadDocuments(fileId: string) {
    const documents = await this.notificationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$notificationDocuments.next(documents);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onNavigateHome() {
    await this.router.navigateByUrl(`home`);
  }

  async onCancel(uuid: string) {
    const dialog = this.confirmationDialogService.openDialog({
      body: 'Are you sure you want to cancel the notification? A cancelled notification cannot be edited or submitted to the ALC. This cannot be undone.',
      confirmAction: 'Confirm',
      cancelAction: 'Return',
    });

    dialog.subscribe(async (isConfirmed) => {
      if (isConfirmed) {
        await this.notificationSubmissionService.cancel(uuid);
        await this.router.navigateByUrl(`home`);
      }
    });
  }

  onDownloadSubmissionPdf(fileNumber: string) {
    //TODO: When we add PDFs
  }
}
