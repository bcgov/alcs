import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ApplicationReviewDto, UpdateApplicationReviewDto } from './application-review.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationReviewService {
  private serviceUrl = `${environment.apiUrl}/application-review`;

  $applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getByFileId(fileId: string) {
    try {
      const applicationReview = await firstValueFrom(
        this.httpClient.get<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}`)
      );
      this.$applicationReview.next(applicationReview);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application Review, please try again later');
    }
  }

  async startReview(fileId: string) {
    try {
      return await firstValueFrom(this.httpClient.post<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}/start`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Application Review, please try again later');
      return undefined;
    }
  }

  async update(fileId: string, updateDto: UpdateApplicationReviewDto) {
    try {
      const updatedAppReview = await firstValueFrom(
        this.httpClient.post<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}`, updateDto)
      );
      this.toastService.showSuccessToast('Application Review Saved');
      this.$applicationReview.next(updatedAppReview);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application Review, please try again later');
    }
  }
}
