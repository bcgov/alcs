import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionUpdateDto,
} from '../application-submission/application-submission.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionDraftService {
  private serviceUrl = `${environment.apiUrl}/application-submission-draft`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<ApplicationSubmissionDetailedDto>(`${this.serviceUrl}/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async updatePending(fileId: string, updateDto: ApplicationSubmissionUpdateDto) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.put<ApplicationSubmissionDetailedDto>(`${this.serviceUrl}/${fileId}`, updateDto)
      );
      this.toastService.showSuccessToast('Application Saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }

    return undefined;
  }

  async publish(fileId: string) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.post<void>(`${this.serviceUrl}/${fileId}/publish`, {}));
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async delete(fileId: string) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.delete<void>(`${this.serviceUrl}/${fileId}`));
      this.toastService.showSuccessToast('Draft Edit Deleted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
  }
}
