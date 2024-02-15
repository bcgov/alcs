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
    if (updateDto.nfuProjectDuration && updateDto.nfuProjectDuration.length > 500) {
      this.toastService.showErrorToast('Project duration exceeds maximum length of 500 characters');
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
    if (updateDto.naruProjectDuration && updateDto.naruProjectDuration.length > 500) {
      this.toastService.showErrorToast('Project duration exceeds maximum length of 500 characters');
      return undefined;
    }
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
    let res;
    try {
      this.overlayService.showSpinner();
      res = await firstValueFrom(
        this.httpClient.post<ApplicationSubmissionDto>(`${this.serviceUrl}/alcs/submit/${uuid}`, {})
      );
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
    return res;
  }
}
