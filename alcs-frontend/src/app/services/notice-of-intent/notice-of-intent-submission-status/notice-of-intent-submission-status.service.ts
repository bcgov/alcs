import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  NoticeOfIntentStatusDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from './notice-of-intent-submission-status.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentSubmissionStatusService {
  private baseUrl = `${environment.apiUrl}/notice-of-intent-submission-status`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async listStatuses(): Promise<NoticeOfIntentStatusDto[]> {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentStatusDto[]>(`${this.baseUrl}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch NOI Statuses');
      throw e;
    }
  }

  async fetchSubmissionStatusesByFileNumber(
    fileNumber: string,
    showErrorToast = true
  ): Promise<NoticeOfIntentSubmissionToSubmissionStatusDto[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<NoticeOfIntentSubmissionToSubmissionStatusDto[]>(`${this.baseUrl}/${fileNumber}`)
      );
      return result;
    } catch (e) {
      if (showErrorToast) {
        this.toastService.showErrorToast('Failed to fetch NOI Submission Statuses');
      }
      throw e;
    }
  }

  async fetchCurrentStatusByFileNumber(
    fileNumber: string,
    showErrorToast = true
  ): Promise<NoticeOfIntentSubmissionToSubmissionStatusDto> {
    try {
      const result = await firstValueFrom(
        this.http.get<NoticeOfIntentSubmissionToSubmissionStatusDto>(`${this.baseUrl}/current-status/${fileNumber}`)
      );
      return result;
    } catch (e) {
      if (showErrorToast) {
        this.toastService.showErrorToast('Failed to fetch NOI Submission Status');
      }
      throw e;
    }
  }
}
