import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationDocumentDto } from './application-document.dto';

export type DOCUMENT_TYPE = 'decisionDocument' | 'reviewDocument';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDocumentService {
  private url = `${environment.apiUrl}/application-document`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async list(fileNumber: string, documentType: DOCUMENT_TYPE) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/${documentType}`)
    );
  }

  async upload(fileNumber: string, documentType: DOCUMENT_TYPE, file: File) {
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return;
    }

    let formData: FormData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/application/${fileNumber}/${documentType}`, formData));
    this.toastService.showSuccessToast('Decision document uploaded');
    return res;
  }

  async delete(documentId: string) {
    return firstValueFrom(this.http.delete<ApplicationDocumentDto[]>(`${this.url}/${documentId}`));
  }

  async download(uuid: string, fileName: string) {
    const data = await firstValueFrom(this.http.get<{ url: string }>(`${this.url}/${uuid}`));
    const downloadLink = document.createElement('a');
    downloadLink.href = data.url;
    downloadLink.download = fileName;
    downloadLink.target = '_blank';
    if (window.webkitURL == null) {
      downloadLink.onclick = (event: MouseEvent) => document.body.removeChild(<Node>event.target);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  }
}
