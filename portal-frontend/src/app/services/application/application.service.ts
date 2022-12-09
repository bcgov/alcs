import { HttpBackend, HttpClient } from '@angular/common/http';
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
  private httpClientNoAuth: HttpClient | null = null;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService,
    handler: HttpBackend
  ) {
    this.httpClientNoAuth = new HttpClient(handler);
  }

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

  async attachExternalFile(fileId: string, data: any) {
    if (data.documents.length > 0) {
      const file: File = data.documents[0];

      // if (file.size > environment.maxFileSize) {
      //   const niceSize = environment.maxFileSize / 1048576;
      //   this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      //   return;
      // }

      try {
        // get presigned url
        const { fileKey, uploadUrl } = await this.documentService.getUploadUrl(fileId);

        const fileBuffer = await file.arrayBuffer();

        // upload to dell ecs
        await firstValueFrom(
          this.httpClientNoAuth!.put(uploadUrl, fileBuffer, {
            headers: { 'Content-Type': file.type },
          })
        );

        // send metadata to portal -> alcs
        const payload = {
          type: 'certificateOfTitle',
          applicationFileNumber: fileId,
          mimeType: file.type,
          fileName: file.name,
          fileKey: fileKey,
          source: 'Applicant',
        };

        await firstValueFrom(
          this.httpClient.post(
            `${environment.apiUrl}/application-document/attachExternal/application/${fileId}`,
            payload
          )
        );
        this.toastService.showSuccessToast('Document uploaded');
      } catch (e) {
        console.error(e);
        this.toastService.showErrorToast('Failed to attach document to Application, please try again');
      }
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
