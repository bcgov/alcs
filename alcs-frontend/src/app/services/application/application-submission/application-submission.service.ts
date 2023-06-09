import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { openFileInline } from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubmissionDto } from '../application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionService {
  private baseUrl = `${environment.apiUrl}/application-submission`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmission(fileNumber: string): Promise<ApplicationSubmissionDto> {
    try {
      return firstValueFrom(this.http.get<ApplicationSubmissionDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission');
      throw e;
    }
  }

  async setSubmissionStatus(fileNumber: string, statusCode: string): Promise<ApplicationSubmissionDto> {
    try {
      return firstValueFrom(
        this.http.patch<ApplicationSubmissionDto>(`${this.baseUrl}/${fileNumber}/update-status`, {
          statusCode,
        })
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application Submission Status');
      throw e;
    }
  }
}
