import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import {
  NOTIFICATION_STATUS,
  NotificationSubmissionDetailedDto,
} from '../../../../services/notification-submission/notification-submission.dto';

@Component({
  selector: 'app-alc-review',
  templateUrl: './alc-review.component.html',
  styleUrls: ['./alc-review.component.scss'],
})
export class AlcReviewComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  @Input() $notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
  @Input() $notificationDocuments = new BehaviorSubject<NotificationDocumentDto[]>([]);

  notificationSubmission: NotificationSubmissionDetailedDto | undefined;
  NOTIFICATION_STATUS = NOTIFICATION_STATUS;

  constructor() {}

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      this.notificationSubmission = noiSubmission;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
