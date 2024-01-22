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

  async setContactEmail(email: string, fileNumber: string): Promise<NotificationSubmissionDetailedDto> {
    try {
      return firstValueFrom(
        this.http.patch<NotificationSubmissionDetailedDto>(`${this.baseUrl}/${fileNumber}`, {
          contactEmail: email,
        })
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Notification Submission');
      throw e;
    }
  }
}
