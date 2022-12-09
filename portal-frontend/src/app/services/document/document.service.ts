import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadDocumentUrlDto } from './document.dto';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private serviceUrl = `${environment.apiUrl}/document`;

  constructor(private httpClient: HttpClient) {}

  async getUploadUrl(fileNumber: string) {
    return await firstValueFrom(
      this.httpClient.get<UploadDocumentUrlDto>(`${this.serviceUrl}/getUploadUrl/${fileNumber}`)
    );
  }
}
