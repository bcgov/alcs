import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private serviceUrl = `${environment.apiUrl}/application`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService
  ) {}

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

  async create(type: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {
          type,
        })
      );
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

  async submitToAlcs(fileId: string, updateDto: UpdateApplicationDto) {
    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/alcs/submit/${fileId}`, updateDto));
      this.toastService.showSuccessToast('Application Submitted');
    } catch (e) {
      this.toastService.showErrorToast('Failed to submit Application, please try again');
    }
  }

  async attachExternalFile(fileId: string, files: File[]) {
    if (files.length > 0) {
      const file: File = files[0];
      const documentType = 'certificateOfTitle';

      if (file.size > environment.maxFileSize) {
        const niceSize = environment.maxFileSize / 1048576;
        this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
        return;
      }

      try {
        const fileKey = await this.documentService.uploadFileToStorage(fileId, file, documentType);

        // create document metadata record in PORTAL.
        // Document record will be created in ALCS, however the link between application and document will be in PORTAL till application submitted to ALCS
        await firstValueFrom(
          this.httpClient.post(`${environment.apiUrl}/application-document/application/${fileId}/attachExternal`, {
            documentType: documentType,
            mimeType: file.type,
            fileName: file.name,
            fileSize: file.size,
            fileKey: fileKey,
            source: 'Applicant',
          })
        );
        this.toastService.showSuccessToast('Document uploaded');
      } catch (e) {
        console.error(e);
        this.toastService.showErrorToast('Failed to attach document to Application, please try again');
      }
    }
  }

  async openFile(fileUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${environment.apiUrl}/application-document/${fileUuid}/open`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete document, please try again');
    }
    return undefined;
  }

  async deleteExternalFile(fileUuid: string) {
    try {
      await firstValueFrom(this.httpClient.delete(`${environment.apiUrl}/application-document/${fileUuid}`));
      this.toastService.showSuccessToast('Document deleted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete document, please try again');
    }
  }
}
