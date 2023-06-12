import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { verifyFileSize } from '../../../shared/utils/file-size-checker';
import { ToastService } from '../../toast/toast.service';
import {
  NoticeOfIntentDecisionDto,
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
  UpdateNoticeOfIntentDecisionDto,
} from './notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionService {
  private url = `${environment.apiUrl}/notice-of-intent-decision`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByFileNumber(fileNumber: string) {
    let decisions: NoticeOfIntentDecisionDto[] = [];
    try {
      decisions = await firstValueFrom(
        this.http.get<NoticeOfIntentDecisionDto[]>(`${this.url}/notice-of-intent/${fileNumber}`)
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return decisions;
  }

  async fetchCodes() {
    let outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];
    try {
      const res = await firstValueFrom(
        this.http.get<{
          outcomes: NoticeOfIntentDecisionOutcomeCodeDto[];
        }>(`${this.url}/codes`)
      );
      outcomes = res.outcomes;
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return {
      outcomes,
    };
  }

  async update(uuid: string, data: UpdateNoticeOfIntentDecisionDto) {
    try {
      const res = await firstValueFrom(this.http.patch<NoticeOfIntentDecisionDto>(`${this.url}/${uuid}`, data));
      this.toastService.showSuccessToast('Decision updated');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to update decision');
      }
      throw e;
    }
  }

  async create(decision: CreateNoticeOfIntentDecisionDto) {
    try {
      const res = await firstValueFrom(this.http.post<NoticeOfIntentDecisionDto>(`${this.url}`, decision));
      this.toastService.showSuccessToast('Decision created');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast(`Failed to create decision`);
      }
      throw e;
    }
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<NoticeOfIntentDecisionDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Decision deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete decision');
    }
  }

  async uploadFile(decisionUuid: string, file: File) {
    const isValidSize = verifyFileSize(file, this.toastService);
    if (!isValidSize) {
      return;
    }

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/${decisionUuid}/file`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
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
