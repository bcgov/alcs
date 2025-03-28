import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDocumentDto, NoticeOfIntentDocumentUpdateDto } from './notice-of-intent-document.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDocumentService {
  private serviceUrl = `${environment.apiUrl}/notice-of-intent-document`;

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
    return await this.documentService.uploadFile<NoticeOfIntentDocumentDto>(
      fileNumber,
      file,
      documentType,
      source,
      `${this.serviceUrl}/notice-of-intent/${fileNumber}/attachExternal`,
    );
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

  async downloadFile(fileUuid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<{ url: string }>(`${this.serviceUrl}/${fileUuid}/download`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to download the document, please try again');
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

  async update(fileNumber: string | undefined, updateDtos: NoticeOfIntentDocumentUpdateDto[]) {
    try {
      await firstValueFrom(
        this.httpClient.patch<void>(`${this.serviceUrl}/notice-of-intent/${fileNumber}`, updateDtos)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update documents, please try again');
    }
    return undefined;
  }

  async getByFileId(fileNumber: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NoticeOfIntentDocumentDto[]>(`${this.serviceUrl}/notice-of-intent/${fileNumber}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch documents, please try again');
    }
    return undefined;
  }
}
