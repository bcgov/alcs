import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NotificationSubmissionToSubmissionStatusDto } from '../notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationSubmissionStatusService {
  private baseUrl = `${environment.apiUrl}/notification-submission-status`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmissionStatusesByFileNumber(
    fileNumber: string
  ): Promise<NotificationSubmissionToSubmissionStatusDto[]> {
    try {
      return await firstValueFrom(
        this.http.get<NotificationSubmissionToSubmissionStatusDto[]>(`${this.baseUrl}/${fileNumber}`)
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Notification Submission Statuses');
      return [];
    }
  }

  async fetchCurrentStatusByFileNumber(
    fileNumber: string,
    showErrorToast = true
  ): Promise<NotificationSubmissionToSubmissionStatusDto> {
    try {
      const result = await firstValueFrom(
        this.http.get<NotificationSubmissionToSubmissionStatusDto>(`${this.baseUrl}/current-status/${fileNumber}`)
      );
      return result;
    } catch (e) {
      if (showErrorToast) {
        this.toastService.showErrorToast('Failed to fetch Notification Submission Status');
      }
      throw e;
    }
  }
}
