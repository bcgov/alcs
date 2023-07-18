import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubmissionToSubmissionStatusDto } from './application-submission-status.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionStatusService {
  private baseUrl = `${environment.apiUrl}/application-submission-status`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmissionStatusesByFileNumber(fileNumber: string): Promise<ApplicationSubmissionToSubmissionStatusDto[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<ApplicationSubmissionToSubmissionStatusDto[]>(`${this.baseUrl}/${fileNumber}`)
      );
      return result;
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission Statuses');
      throw e;
    }
  }

  async fetchCurrentStatusByFileNumber(fileNumber: string): Promise<ApplicationSubmissionToSubmissionStatusDto> {
    try {
      const result = await firstValueFrom(
        this.http.get<ApplicationSubmissionToSubmissionStatusDto>(`${this.baseUrl}/current-status/${fileNumber}`)
      );
      return result;
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission Status');
      throw e;
    }
  }
}
