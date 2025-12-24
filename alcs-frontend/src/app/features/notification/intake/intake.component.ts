import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionService } from '../../../services/notification/notification-submission/notification-submission.service';
import { NotificationTimelineService } from '../../../services/notification/notification-timeline/notification-timeline.service';
import { NotificationDto, UpdateNotificationDto } from '../../../services/notification/notification.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-intake',
    templateUrl: './intake.component.html',
    styleUrls: ['./intake.component.scss'],
    standalone: false
})
export class IntakeComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  dateSubmittedToAlc?: string;
  notification?: NotificationDto;
  localGovernments: { label: string; value: string; disabled?: boolean | null }[] = [];
  contactEmail: string | null = null;
  responseSent = false;
  responseDate: number | null = null;
  regions: { label: string; value: string }[] = [];

  constructor(
    private notificationDetailService: NotificationDetailService,
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationTimelineService: NotificationTimelineService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private confirmationDialogService: ConfirmationDialogService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.notificationDetailService.$notification.pipe(takeUntil(this.$destroy)).subscribe((notification) => {
      if (notification) {
        this.dateSubmittedToAlc = moment(notification.dateSubmittedToAlc).format(environment.dateFormat);
        this.notification = notification;

        this.loadSubmission(notification.fileNumber);
      }
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions.map((region) => ({
        label: region.label,
        value: region.code,
      }));
    });

    this.loadGovernments();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async updateNotificationDate(field: keyof UpdateNotificationDto, time: number) {
    const notification = this.notification;
    if (notification) {
      const update = await this.notificationDetailService.update(notification.fileNumber, {
        [field]: time,
      });
      if (update) {
        this.toastService.showSuccessToast('Notification updated');
      }
    }
  }

  async updateSubmissionEmail(email: string | null) {
    if (!email) {
      return;
    }

    let message =
      '<ul><li>Any changes made here will also be reflected in the Portal.</li>' +
      '<li>The ALC response will be emailed to the new address. The LTSA PDF will not be regenerated.</li>' +
      '</ul>Do you want to continue?';

    this.confirmationDialogService
      .openDialog({
        title: 'Change Primary Contact Email',
        body: message,
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          const notification = this.notification;
          if (notification) {
            const update = await this.notificationSubmissionService.setContactEmail(email, notification.fileNumber);
            if (update) {
              this.toastService.showSuccessToast('Notification updated');
              this.contactEmail = email;
              this.resendResponse();
            }
          }
        }
      });
  }

  async onSaveLocalGovernment($value: string | string[] | null) {
    this.confirmationDialogService
      .openDialog({
        title: 'Local/First Nation Government',
        body: 'Any changes made here will also be reflected in the portal. Do you want to continue?',
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          const notification = this.notification;
          if (notification && typeof $value === 'string') {
            const update = await this.notificationDetailService.update(notification.fileNumber, {
              localGovernmentUuid: $value,
            });
            if (update) {
              this.toastService.showSuccessToast('Notification updated');
            }
          }
        }
      });
  }

  async updateRegion($event: string | string[] | null) {
    if (this.notification && $event && !Array.isArray($event)) {
      const update = await this.notificationDetailService.update(this.notification.fileNumber, {
        regionCode: $event,
      });
      if (update) {
        this.toastService.showSuccessToast('Notification updated');
      }
    }
  }

  async resendResponse() {
    if (this.notification) {
      const res = await this.notificationDetailService.resendResponse(this.notification.fileNumber);
      if (res) {
        this.toastService.showSuccessToast('Response Sent');
      }
    }
  }

  private async loadGovernments() {
    const localGovernment = await this.localGovernmentService.list();
    this.localGovernments = localGovernment.map((government) => ({
      label: government.name,
      value: government.uuid,
    }));
  }

  private async loadSubmission(fileNumber: string) {
    const submission = await this.notificationSubmissionService.fetchSubmission(fileNumber);
    this.contactEmail = submission.contactEmail;

    const events = await this.notificationTimelineService.fetchByFileNumber(fileNumber);
    const alcResponseEvent = events.find((event) => /alc response sent/i.test(event.htmlText));

    this.responseSent = alcResponseEvent !== undefined;
    this.responseDate = alcResponseEvent?.startDate ?? null;
  }
}
