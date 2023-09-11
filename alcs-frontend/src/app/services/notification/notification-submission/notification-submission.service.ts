import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NotificationSubmissionDetailedDto, NotificationSubmissionDto } from '../notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationSubmissionService {
  private baseUrl = `${environment.apiUrl}/notification-submission`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmission(fileNumber: string): Promise<NotificationSubmissionDetailedDto> {
    try {
      return firstValueFrom(this.http.get<NotificationSubmissionDetailedDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Notification Submission');
      throw e;
    }
  }

  async setSubmissionStatus(fileNumber: string, statusCode: string): Promise<NotificationSubmissionDto> {
    try {
      return firstValueFrom(
        this.http.patch<NotificationSubmissionDto>(`${this.baseUrl}/${fileNumber}/update-status`, {
          statusCode,
        })
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Notification Submission Status');
      throw e;
    }
  }
}
