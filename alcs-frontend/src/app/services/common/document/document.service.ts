import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  baseUrl = `${environment.apiUrl}/document`;

  constructor(private http: HttpClient) {}

  async getDownloadUrlAndFileName(uuid: string, isInline = true): Promise<{ url: string; fileName: string }> {
    const url =
      `${this.baseUrl}/getDownloadUrlAndFileName/${uuid}` + (isInline ? `?isInline=${isInline.toString()}` : '');

    return await firstValueFrom(this.http.get<{ url: string; fileName: string }>(url));
  }
}
