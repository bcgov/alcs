import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionService } from '../../../services/notification/notification-submission/notification-submission.service';
import {
  NOTIFICATION_STATUS,
  NotificationDto,
  UpdateNotificationDto,
} from '../../../services/notification/notification.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss'],
})
export class IntakeComponent implements OnInit {
  dateSubmittedToAlc?: string;
  notification?: NotificationDto;
  localGovernments: { label: string; value: string; disabled?: boolean | null }[] = [];
  contactEmail: string | null = null;
  responseSent = false;
  responseDate: number | null = null;

  constructor(
    private notificationDetailService: NotificationDetailService,
    private notificationSubmissionService: NotificationSubmissionService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.notificationDetailService.$notification.subscribe((notification) => {
      if (notification) {
        this.dateSubmittedToAlc = moment(notification.dateSubmittedToAlc).format(environment.dateFormat);
        this.notification = notification;

        this.loadSubmission(notification.fileNumber);
      }
    });

    this.loadGovernments();
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

    this.confirmationDialogService
      .openDialog({
        title: 'Change Primary Contact Email',
        body: 'Any changes made here will also be reflected in the portal. Do you want to continue?',
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          const notification = this.notification;
          if (notification) {
            const update = await this.notificationSubmissionService.setContactEmail(email, notification.fileNumber);
            if (update) {
              this.toastService.showSuccessToast('Notification updated');
            }
          }
        }
      });
  }

  private async loadGovernments() {
    const localGovernment = await this.localGovernmentService.list();
    this.localGovernments = localGovernment.map((government) => ({
      label: government.name,
      value: government.uuid,
    }));
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

  private async loadSubmission(fileNumber: string) {
    const submission = await this.notificationSubmissionService.fetchSubmission(fileNumber);
    this.contactEmail = submission.contactEmail;

    this.responseSent = submission.status.code === NOTIFICATION_STATUS.ALC_RESPONSE;
    this.responseDate = submission.lastStatusUpdate;
  }

  async resendResponse() {
    if (this.notification) {
      await this.notificationDetailService.resendResponse(this.notification.fileNumber);
      this.toastService.showSuccessToast('Response Sent');
    }
  }
}
