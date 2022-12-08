import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private serviceUrl = `${environment.apiUrl}/application`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async create() {
    try {
      return firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create Application, please try again later');
    }
    return undefined;
  }

  async updatePending(fileId: string, updateDto: UpdateApplicationDto) {
    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/${fileId}`, updateDto));
      this.toastService.showSuccessToast('Application Saved');
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application, please try again');
    }
  }

  async attachFile(fileId: string, documents: File[]) {
    let formData: FormData = new FormData();
    if (documents.length > 0) {
      formData.append('certificateOfTitle', documents[0], documents[0].name);
    }

    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/${fileId}/document`, formData));
      this.toastService.showSuccessToast('Document uploaded');
    } catch (e) {
      this.toastService.showErrorToast('Failed to attach document to Application, please try again');
    }
  }

  async getApplications() {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to load Applications, please try again later');
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto>(`${this.serviceUrl}/${fileId}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async submitToAlcs(fileId: string, updateDto: UpdateApplicationDto) {
    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/alcs/submit/${fileId}`, updateDto));
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    }
  }
}
