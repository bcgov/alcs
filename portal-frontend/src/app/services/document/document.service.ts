import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ToastService } from '../toast/toast.service';
import { UploadDocumentUrlDto } from './document.dto';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private serviceUrl = `${environment.apiUrl}/document`;
  private httpClientNoAuth: HttpClient | null = null;

  constructor(
    private httpClient: HttpClient,
    handler: HttpBackend,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {
    this.httpClientNoAuth = new HttpClient(handler);
  }

  async getUploadUrl(fileNumber: string, documentType: string | null) {
    return await firstValueFrom(
      this.httpClient.get<UploadDocumentUrlDto>(`${this.serviceUrl}/getUploadUrl/${fileNumber}/${documentType}`)
    );
  }

  private async uploadFileToStorage(fileId: string, file: File, documentType: string | null) {
    // get presigned url
    const { fileKey, uploadUrl } = await this.getUploadUrl(fileId, documentType);

    const fileBuffer = await file.arrayBuffer();

    // upload to dell ecs
    await firstValueFrom(
      this.httpClientNoAuth!.put(uploadUrl, fileBuffer, {
        headers: { 'Content-Type': file.type },
      })
    );

    return fileKey;
  }

  async uploadFile<T>(
    fileId: string,
    file: File,
    documentType: DOCUMENT_TYPE | null,
    source: DOCUMENT_SOURCE,
    url: string
  ) {
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return undefined;
    }

    try {
      this.overlayService.showSpinner();
      const fileKey = await this.uploadFileToStorage(fileId, file, documentType);

      return await firstValueFrom(
        this.httpClient.post<T>(url, {
          fileNumber: fileId,
          documentType: documentType,
          mimeType: file.type,
          fileName: file.name,
          fileSize: file.size,
          fileKey: fileKey,
          source,
        })
      );
    } finally {
      this.overlayService.hideSpinner();
    }
  }
}
