import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionService } from '../../../services/notification/notification-submission/notification-submission.service';
import { NotificationDto, NotificationSubmissionDetailedDto } from '../../../services/notification/notification.dto';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';

@Component({
  selector: 'app-applicant-info',
  templateUrl: './applicant-info.component.html',
  styleUrls: ['./applicant-info.component.scss'],
})
export class ApplicantInfoComponent implements OnInit, OnDestroy {
  fileNumber: string = '';
  applicant: string = '';
  destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;
  notification: NotificationDto | undefined;
  submission?: NotificationSubmissionDetailedDto = undefined;
  isSubmittedToAlc = false;

  constructor(
    private notificationDetailService: NotificationDetailService,
    private notificationSubmissionService: NotificationSubmissionService
  ) {}

  ngOnInit(): void {
    this.notificationDetailService.$notification.pipe(takeUntil(this.destroy)).subscribe(async (notification) => {
      if (notification) {
        this.notification = notification;
        this.fileNumber = notification.fileNumber;

        this.submission = await this.notificationSubmissionService.fetchSubmission(this.fileNumber);
        this.isSubmittedToAlc = !!notification.dateSubmittedToAlc;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
