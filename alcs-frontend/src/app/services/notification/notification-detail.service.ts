import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationDto, UpdateNotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationDetailService {
  $notification = new BehaviorSubject<NotificationDto | undefined>(undefined);

  constructor(private notificationService: NotificationService) {}

  async load(fileNumber: string) {
    this.clear();
    const notification = await this.notificationService.fetchByFileNumber(fileNumber);
    this.$notification.next(notification);
  }

  clear() {
    this.$notification.next(undefined);
  }

  async update(fileNumber: string, updateDto: UpdateNotificationDto) {
    const updatedNotification = await this.notificationService.update(fileNumber, updateDto);
    if (updatedNotification) {
      this.$notification.next(updatedNotification);
    }
    return updatedNotification;
  }

  async cancel(fileNumber: string) {
    await this.notificationService.cancel(fileNumber);
    await this.load(fileNumber);
  }

  async uncancel(fileNumber: string) {
    await this.notificationService.uncancel(fileNumber);
    await this.load(fileNumber);
  }

  async resendResponse(fileNumber: string) {
    const updatedNotification = await this.notificationService.resendResponse(fileNumber);
    if (updatedNotification) {
      this.$notification.next(updatedNotification);
    }
    return updatedNotification;
  }
}
