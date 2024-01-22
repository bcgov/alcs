import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NoticeOfIntentSubmissionDto } from '../notice-of-intent.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentSubmissionService {
  private baseUrl = `${environment.apiUrl}/notice-of-intent-submission`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmission(fileNumber: string): Promise<NoticeOfIntentSubmissionDto> {
    try {
      return firstValueFrom(this.http.get<NoticeOfIntentSubmissionDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Notice of Intent Submission');
      throw e;
    }
  }

  async setSubmissionStatus(fileNumber: string, statusCode: string): Promise<NoticeOfIntentSubmissionDto> {
    try {
      return firstValueFrom(
        this.http.patch<NoticeOfIntentSubmissionDto>(`${this.baseUrl}/${fileNumber}/update-status`, {
          statusCode,
        })
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Notice of Intent Submission Status');
      throw e;
    }
  }
}
