import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { SubmittedApplicationDto } from '../application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionService {
  private baseUrl = `${environment.apiUrl}/application-submission`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchSubmission(fileNumber: string): Promise<SubmittedApplicationDto> {
    try {
      return firstValueFrom(this.http.get<SubmittedApplicationDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission');
      throw e;
    }
  }
}
