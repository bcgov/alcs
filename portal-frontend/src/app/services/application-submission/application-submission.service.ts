import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionService {
  private serviceUrl = `${environment.apiUrl}/application-submission`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async getApplications() {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationSubmissionDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Applications, please try again later');
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<ApplicationSubmissionDetailedDto>(`${this.serviceUrl}/application/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async getByUuid(uuid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async create(type: string, prescribedBody?: string) {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(
        this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {
          type,
          prescribedBody,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Application, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async updatePending(uuid: string, updateDto: ApplicationSubmissionUpdateDto) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.put<ApplicationSubmissionDetailedDto>(`${this.serviceUrl}/${uuid}`, updateDto)
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

  async cancel(uuid: string) {
    try {
      this.overlayService.showSpinner();
      return await firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}/${uuid}/cancel`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to cancel Application, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async submitToAlcs(uuid: string) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(
        this.httpClient.post<ApplicationSubmissionDto>(`${this.serviceUrl}/alcs/submit/${uuid}`, {})
      );
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
  }
}
