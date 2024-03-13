import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { GetPublicApplicationResponseDto } from './public-application.dto';
import { GetPublicNoticeOfIntentResponseDto } from './public-notice-of-intent.dto';
import { GetPublicNotificationResponseDto } from './public-notification.dto';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private serviceUrl = `${environment.authUrl}/public`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getApplication(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<GetPublicApplicationResponseDto>(`${this.serviceUrl}/application/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async getApplicationOpenFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string; fileName: string }>(`${this.serviceUrl}/application/${fileId}/${uuid}/open`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application File, please try again later');
      return undefined;
    }
  }

  async getApplicationDownloadFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${this.serviceUrl}/application/${fileId}/${uuid}/download`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application File, please try again later');
      return undefined;
    }
  }

  async getNoticeOfIntent(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<GetPublicNoticeOfIntentResponseDto>(`${this.serviceUrl}/notice-of-intent/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent, please try again later');
      return undefined;
    }
  }

  async getNoticeOfIntentOpenFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string; fileName: string }>(
          `${this.serviceUrl}/notice-of-intent/${fileId}/${uuid}/open`
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent File, please try again later');
      return undefined;
    }
  }

  async getNoticeOfIntentDownloadFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${this.serviceUrl}/notice-of-intent/${fileId}/${uuid}/download`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent File, please try again later');
      return undefined;
    }
  }

  async getNotification(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<GetPublicNotificationResponseDto>(`${this.serviceUrl}/notification/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notification, please try again later');
      return undefined;
    }
  }

  async getNotificationOpenFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string; fileName: string }>(`${this.serviceUrl}/notification/${fileId}/${uuid}/open`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notification, please try again later');
      return undefined;
    }
  }

  async getNotificationDownloadFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${this.serviceUrl}/notification/${fileId}/${uuid}/download`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notification, please try again later');
      return undefined;
    }
  }
}
