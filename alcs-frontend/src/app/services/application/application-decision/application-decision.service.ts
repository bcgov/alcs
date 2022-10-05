import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeDto,
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionService {
  private url = `${environment.apiUrl}/application-decision`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(fileNumber: string) {
    let decisions: ApplicationDecisionDto[] = [];
    let codes: ApplicationDecisionOutcomeDto[] = [];

    try {
      const res = await firstValueFrom(
        this.http.get<{ decisions: ApplicationDecisionDto[]; codes: ApplicationDecisionOutcomeDto[] }>(
          `${this.url}/application/${fileNumber}`
        )
      );
      decisions = res.decisions;
      codes = res.codes;
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return {
      decisions,
      codes,
    };
  }

  async update(uuid: string, data: UpdateApplicationDecisionDto) {
    try {
      await firstValueFrom(this.http.patch<ApplicationDecisionDto>(`${this.url}/${uuid}`, data));
      this.toastService.showSuccessToast('Meeting updated.');
    } catch (e) {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }

  async create(decision: CreateApplicationDecisionDto) {
    try {
      await firstValueFrom(this.http.post<ApplicationDecisionDto>(`${this.url}`, decision));
      this.toastService.showSuccessToast('Meeting created.');
    } catch (e) {
      this.toastService.showErrorToast(`Failed to create decision`);
    }
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Meeting deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }
  }

  async uploadFile(decisionUuid: string, file: File) {
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return;
    }

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/${decisionUuid}/file`, formData));
    this.toastService.showSuccessToast('Decision document uploaded');
    return res;
  }

  async downloadFile(decisionUuid: string, documentUuid: string, fileName: string, isInline = true) {
    const url = `${this.url}/${decisionUuid}/file/${documentUuid}`;
    const finalUrl = isInline ? `${url}/open` : `${url}/download`;
    const data = await firstValueFrom(this.http.get<{ url: string }>(finalUrl));
    if (isInline) {
      openFileInline(data.url, fileName);
    } else {
      downloadFileFromUrl(data.url, fileName);
    }
  }

  async deleteFile(decisionUuid: string, documentUuid: string) {
    const url = `${this.url}/${decisionUuid}/file/${documentUuid}`;
    return await firstValueFrom(this.http.delete<{ url: string }>(url));
  }
}
