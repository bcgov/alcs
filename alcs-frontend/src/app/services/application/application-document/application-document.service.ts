import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationDocumentDto } from './application-document.dto';

const MAX_FILE_SIZE = 104857600;

@Injectable({
  providedIn: 'root',
})
export class ApplicationDocumentService {
  private url = `${environment.apiRoot}/application-document`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async list(fileNumber: string) {
    return firstValueFrom(this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}`));
  }

  async upload(fileNumber: string, file: File) {
    if (file.size > MAX_FILE_SIZE) {
      this.toastService.showWarningToast('Maximum file size is 100MB, please choose a smaller file');
      return;
    }

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/application/${fileNumber}`, formData));
    this.toastService.showSuccessToast('Decision document uploaded');
    return res;
  }

  async delete(documentId: string) {
    return firstValueFrom(this.http.delete<ApplicationDocumentDto[]>(`${this.url}/${documentId}`));
  }

  async download(uuid: string, fileName: string) {
    const data = await firstValueFrom(this.http.get<{ url: string }>(`${this.url}/${uuid}`));
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.href = data.url;
    if (window.webkitURL == null) {
      // @ts-ignore
      downloadLink.onclick = document.body.removeChild(event.target);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  }
}
