import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { NotificationDocumentDto, NotificationDocumentUpdateDto } from './notification-document.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationDocumentService {
  private serviceUrl = `${environment.apiUrl}/notification-document`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService,
    private overlayService: OverlaySpinnerService
  ) {}

  async attachExternalFile(
    fileNumber: string,
    file: File,
    documentType: DOCUMENT_TYPE | null,
    source = DOCUMENT_SOURCE.APPLICANT
  ) {
    try {
      const res = await this.documentService.uploadFile(
        fileNumber,
        file,
        documentType,
        source,
        `${this.serviceUrl}/notification/${fileNumber}/attachExternal`
      );
      this.toastService.showSuccessToast('Document uploaded');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document, please try again');
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
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}/${fileUuid}`));
      this.toastService.showSuccessToast('Document deleted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete document, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async deleteExternalFiles(fileUuids: string[]) {
    try {
      this.overlayService.showSpinner();
      await firstValueFrom(this.httpClient.post(`${this.serviceUrl}/delete-files`, fileUuids));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete documents');
    } finally {
      this.overlayService.hideSpinner();
    }
  }

  async update(fileNumber: string | undefined, updateDtos: NotificationDocumentUpdateDto[]) {
    try {
      await firstValueFrom(this.httpClient.patch<void>(`${this.serviceUrl}/notification/${fileNumber}`, updateDtos));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update documents, please try again');
    }
    return undefined;
  }

  async getByFileId(fileNumber: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NotificationDocumentDto[]>(`${this.serviceUrl}/notification/${fileNumber}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch documents, please try again');
    }
    return undefined;
  }
}
