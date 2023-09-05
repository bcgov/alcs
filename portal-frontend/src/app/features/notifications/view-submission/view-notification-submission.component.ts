import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NotificationSubmissionDto } from '../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';

@Component({
  selector: 'app-view-notification-submission',
  templateUrl: './view-notification-submission.component.html',
  styleUrls: ['./view-notification-submission.component.scss'],
})
export class ViewNotificationSubmissionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $notificationSubmission = new BehaviorSubject<NotificationSubmissionDto | undefined>(undefined);
  submission: NotificationSubmissionDto | undefined;

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
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
    // const documents = await this.noiDocumentService.getByFileId(fileId);
    // if (documents) {
    //   this.$noiDocuments.next(documents);
    // }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onNavigateHome() {
    await this.router.navigateByUrl(`home`);
  }

  async onCancel(uuid: string) {
    await this.notificationSubmissionService.cancel(uuid);
    await this.router.navigateByUrl(`home`);
  }

  onDownloadSubmissionPdf(fileNumber: string) {
    //TODO: When we add PDFs
  }
}
