import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentSubmissionDraftService {
  private serviceUrl = `${environment.apiUrl}/notice-of-intent-submission-draft`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NoticeOfIntentSubmissionDetailedDto>(`${this.serviceUrl}/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Notice of Intent, please try again later');
      return undefined;
    }
  }

  async updatePending(fileId: string, updateDto: NoticeOfIntentSubmissionUpdateDto) {
    if (updateDto.northLandUseTypeDescription && updateDto.northLandUseTypeDescription.length > 500) {
      this.toastService.showErrorToast('North land use type description exceeds maximum length of 500 characters');
      return undefined;
    }
    if (updateDto.eastLandUseTypeDescription && updateDto.eastLandUseTypeDescription.length > 500) {
      this.toastService.showErrorToast('East land use type description exceeds maximum length of 500 characters');
      return undefined;
    }
    if (updateDto.southLandUseTypeDescription && updateDto.southLandUseTypeDescription.length > 500) {
      this.toastService.showErrorToast('South land use type description exceeds maximum length of 500 characters');
      return undefined;
    }
    if (updateDto.westLandUseTypeDescription && updateDto.westLandUseTypeDescription.length > 500) {
      this.toastService.showErrorToast('West land use type description exceeds maximum length of 500 characters');
      return undefined;
    }
    if (updateDto.fillProjectDuration && updateDto.fillProjectDuration.length > 500) {
      this.toastService.showErrorToast('Project duration exceeds maximum length of 500 characters');
      return undefined;
    }
    if (updateDto.soilProjectDuration && updateDto.soilProjectDuration.length > 500) {
      this.toastService.showErrorToast('Project duration exceeds maximum length of 500 characters');
      return undefined;
    }
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.put<NoticeOfIntentSubmissionDetailedDto>(`${this.serviceUrl}/${fileId}`, updateDto)
      );
      this.toastService.showSuccessToast('Notice of Intent Saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notice of Intent, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }

    return undefined;
  }

  async publish(fileId: string) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.post<void>(`${this.serviceUrl}/${fileId}/publish`, {}));
      this.toastService.showSuccessToast('Notice of Intent Updated');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notice of Intent, please try again');
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
      this.toastService.showErrorToast('Failed to delete draft Notice of Intent, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
  }
}
