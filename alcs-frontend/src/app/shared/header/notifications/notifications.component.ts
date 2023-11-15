import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { MessageService } from '../../../services/message/message.service';

type FormattedNotification = {
  uuid: string;
  createdAt: string;
  read: boolean;
  link: string;
  targetType: 'application';
  body: string;
  title: string;
};

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  formattedNotifications: FormattedNotification[] = [];
  hasUnread = false;
  unreadCount = 0;

  constructor(private router: Router, private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  async loadNotifications() {
    const notifications = await this.messageService.fetchMyNotifications();

    this.formattedNotifications = notifications.map((notification) => ({
      ...notification,
      createdAt: moment(notification.createdAt).format(environment.longTimeFormat),
    }));
    this.calculateCounts(this.formattedNotifications);
  }

  private calculateCounts(formattedNotifications: FormattedNotification[]) {
    const unreadCount = formattedNotifications.reduce((total, notification) => {
      if (!notification.read) {
        return total + 1;
      }
      return total;
    }, 0);
    this.hasUnread = unreadCount > 0;
    this.unreadCount = unreadCount;
  }

  async onSelectNotification(notification: FormattedNotification) {
    await this.messageService.markRead(notification.uuid);
    this.formattedNotifications = this.formattedNotifications.map((formattedNotification) => ({
      ...formattedNotification,
      read: formattedNotification.uuid === notification.uuid ? true : formattedNotification.read,
    }));
    this.calculateCounts(this.formattedNotifications);

    //Convert to relative link if it matches the current URL
    const baseUrl = window.location.protocol + '//' + window.location.host;
    if (notification.link.startsWith(baseUrl)) {
      const redirectLink = document.createElement('a');
      redirectLink.href = notification.link;
      const absoluteLink = redirectLink.pathname + redirectLink.search + redirectLink.hash;
      await this.router.navigateByUrl(absoluteLink);
    } else {
      console.warn('Tried to navigate to external link');
      // Enable this if we want to allow external links
      // window.location.href = notification.link;
    }
  }

  async onMarkAllRead($event: MouseEvent) {
    $event.stopPropagation();
    await this.messageService.markAllRead();
    this.formattedNotifications = this.formattedNotifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    this.calculateCounts(this.formattedNotifications);
  }
}
