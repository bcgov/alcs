import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentSubmissionService {
  private serviceUrl = `${environment.apiUrl}/notice-of-intent-submission`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getNoticeOfIntents() {
    try {
      return await firstValueFrom(this.httpClient.get<NoticeOfIntentSubmissionDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intents, please try again later');
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NoticeOfIntentSubmissionDetailedDto>(`${this.serviceUrl}/application/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent, please try again later');
      return undefined;
    }
  }

  async getByUuid(uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NoticeOfIntentSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent, please try again later');
      return undefined;
    }
  }

  async create(type: string) {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(
        this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {
          type,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Notice of Intent, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async updatePending(uuid: string, updateDto: NoticeOfIntentSubmissionUpdateDto) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.put<NoticeOfIntentSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('Notice of Intent Saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notice of Intent, please try again');
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
      this.toastService.showErrorToast('Failed to cancel Notice of Intent, please try again later');
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
        this.httpClient.post<NoticeOfIntentSubmissionDto>(`${this.serviceUrl}/alcs/submit/${uuid}`, {})
      );
      this.toastService.showSuccessToast('Notice of Intent Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Notice of Intent, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
    return res;
  }
}
