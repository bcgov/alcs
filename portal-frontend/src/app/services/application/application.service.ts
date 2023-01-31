import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ApplicationDto, ApplicationUpdateDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private serviceUrl = `${environment.apiUrl}/application`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getApplications() {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Applications, please try again later');
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto>(`${this.serviceUrl}/${fileId}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async create(type: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {
          type,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Application, please try again later');
    }
    return undefined;
  }

  async updatePending(fileId: string, updateDto: ApplicationUpdateDto) {
    try {
      const result = await firstValueFrom(
        this.httpClient.put<ApplicationDto>(`${this.serviceUrl}/${fileId}`, updateDto)
      );
      this.toastService.showSuccessToast('Application Saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application, please try again');
    }

    return undefined;
  }

  async cancel(fileId: string) {
    try {
      return await firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}/${fileId}/cancel`, {}));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to cancel Application, please try again later');
    }
    return undefined;
  }

  async submitToAlcs(fileId: string, updateDto: ApplicationUpdateDto) {
    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/alcs/submit/${fileId}`, updateDto));
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    }
  }
}
