import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
  NotificationSubmissionUpdateDto,
} from './notification-submission.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationSubmissionService {
  private serviceUrl = `${environment.apiUrl}/notification-submission`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getNotifications() {
    try {
      return await firstValueFrom(this.httpClient.get<NotificationSubmissionDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load SRWs, please try again later');
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NotificationSubmissionDetailedDto>(`${this.serviceUrl}/notification/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load SRW, please try again later');
      return undefined;
    }
  }

  async getByUuid(uuid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<NotificationSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load SRW, please try again later');
      return undefined;
    }
  }

  async create() {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create SRW, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async updatePending(uuid: string, updateDto: NotificationSubmissionUpdateDto) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.put<NotificationSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('SRW Saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update SRW, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }

    return undefined;
  }

  async cancel(uuid: string) {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}/${uuid}/cancel`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to cancel SRW, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async submitToAlcs(uuid: string) {
    let res;
    try {
      this.overlayService.showSpinner();
      res = await firstValueFrom(
        this.httpClient.post<NotificationSubmissionDto>(`${this.serviceUrl}/alcs/submit/${uuid}`, {})
      );
      this.toastService.showSuccessToast('SRW Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit SRW, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
    return res;
  }
}
