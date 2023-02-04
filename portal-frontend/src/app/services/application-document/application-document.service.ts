import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationDocumentUpdateDto, DOCUMENT } from './application-document.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDocumentService {
  private serviceUrl = `${environment.apiUrl}/application-document`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService
  ) {}

  async attachExternalFile(fileNumber: string, file: File, documentType: DOCUMENT | null) {
    try {
      const res = await this.documentService.uploadFile(
        fileNumber,
        file,
        documentType,
        'Applicant',
        `${this.serviceUrl}/application/${fileNumber}/attachExternal`
      );
      this.toastService.showSuccessToast('Document uploaded');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document to Application, please try again');
    }
    return undefined;
  }

  async openFile(fileUuid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<{ url: string }>(`${this.serviceUrl}/${fileUuid}/open`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to open the document, please try again');
    }
    return undefined;
  }

  async deleteExternalFile(fileUuid: string) {
    try {
      await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}/${fileUuid}`));
      this.toastService.showSuccessToast('Document deleted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete document, please try again');
    }
  }

  async update(fileNumber: string | undefined, updateDtos: ApplicationDocumentUpdateDto[]) {
    try {
      await firstValueFrom(this.httpClient.patch<void>(`${this.serviceUrl}/application/${fileNumber}`, updateDtos));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update documents, please try again');
    }
    return undefined;
  }
}
