import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationReviewDto, ReturnApplicationDto, UpdateApplicationReviewDto } from './application-review.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationReviewService {
  private serviceUrl = `${environment.apiUrl}/application-review`;

  $applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getByFileId(fileId: string) {
    try {
      this.overlayService.showSpinner();
      const applicationReview = await firstValueFrom(
        this.httpClient.get<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}`)
      );
      this.$applicationReview.next(applicationReview);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application Review, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async startReview(fileId: string) {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(this.httpClient.post<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}/start`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Application Review, please try again later');
      return undefined;
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async update(fileId: string, updateDto: UpdateApplicationReviewDto) {
    try {
      this.overlayService.showSpinner();
      const updatedAppReview = await firstValueFrom(
        this.httpClient.post<ApplicationReviewDto>(`${this.serviceUrl}/${fileId}`, updateDto)
      );
      this.toastService.showSuccessToast('Application Review Saved');
      this.$applicationReview.next(updatedAppReview);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application Review, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async complete(fileId: string) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.post<{}>(`${this.serviceUrl}/${fileId}/finish`, {}));
      this.toastService.showSuccessToast('Application Review Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Application Review, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async returnApplication(fileId: string, returnDto: ReturnApplicationDto) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.post<{}>(`${this.serviceUrl}/${fileId}/return`, returnDto));
      this.toastService.showSuccessToast('Application returned to Applicant');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to return Application, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
  }
}
