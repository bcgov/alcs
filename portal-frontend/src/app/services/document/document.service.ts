import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadDocumentUrlDto } from './document.dto';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private serviceUrl = `${environment.apiUrl}/document`;
  private httpClientNoAuth: HttpClient | null = null;

  constructor(private httpClient: HttpClient, handler: HttpBackend) {
    this.httpClientNoAuth = new HttpClient(handler);
  }

  async getUploadUrl(fileNumber: string, documentType: string) {
    return await firstValueFrom(
      this.httpClient.get<UploadDocumentUrlDto>(`${this.serviceUrl}/getUploadUrl/${fileNumber}/${documentType}`)
    );
  }

  async uploadFileToStorage(fileId: string, file: File, documentType: string) {
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
}
