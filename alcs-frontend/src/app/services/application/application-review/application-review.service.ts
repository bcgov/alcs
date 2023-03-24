import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationReviewDto } from '../application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationReviewService {
  private baseUrl = `${environment.apiUrl}/application-submission-review`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchReview(fileNumber: string): Promise<ApplicationReviewDto> {
    try {
      return firstValueFrom(this.http.get<ApplicationReviewDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission Review');
      throw e;
    }
  }
}
