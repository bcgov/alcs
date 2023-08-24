import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { verifyFileSize } from '../../../shared/utils/file-size-checker';
import { ToastService } from '../../toast/toast.service';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionWithLinkedResolutionDto,
  UpdateNoticeOfIntentDecisionDto,
} from '../decision/notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionV2Service {
  private url = `${environment.apiUrl}/notice-of-intent-decision/v2`;
  private decision: NoticeOfIntentDecisionDto | undefined;
  private decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[] = [];
  $decision = new BehaviorSubject<NoticeOfIntentDecisionDto | undefined>(undefined);
  $decisions = new BehaviorSubject<NoticeOfIntentDecisionWithLinkedResolutionDto[]>([]);

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

  async fetchCodes(): Promise<NoticeOfIntentDecisionCodesDto> {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDecisionCodesDto>(`${this.url}/codes`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return {
      outcomes: [],
      decisionComponentTypes: [],
      decisionConditionTypes: [],
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
      this.toastService.showErrorToast('Failed to delete meeting');
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
    this.toastService.showSuccessToast('Document uploaded');
    return res;
  }

  async updateFile(decisionUuid: string, documentUuid: string, fileName: string) {
    try {
      await firstValueFrom(
        this.http.patch(`${this.url}/${decisionUuid}/file/${documentUuid}`, {
          fileName,
        })
      );
      this.toastService.showSuccessToast('File updated');
    } catch (err) {
      this.toastService.showErrorToast('Failed to update file');
    }
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

  async getByUuid(uuid: string) {
    let decision: NoticeOfIntentDecisionDto | undefined;
    try {
      decision = await firstValueFrom(this.http.get<NoticeOfIntentDecisionDto>(`${this.url}/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision');
    }
    return decision;
  }

  async loadDecision(uuid: string) {
    this.clearDecision();
    this.decision = await this.getByUuid(uuid);
    this.$decision.next(this.decision);
  }

  async loadDecisions(fileNumber: string) {
    this.clearDecisions();
    const decisions = await this.fetchByFileNumber(fileNumber);
    const decisionsLength = decisions.length;

    this.decisions = decisions.map((decision, ind) => ({
      ...decision,
      modifiedByResolutions: decision.modifiedBy?.flatMap((r) => r.linkedResolutions) || [],
      index: decisionsLength - ind,
    }));

    this.$decisions.next(this.decisions);
  }

  clearDecision() {
    this.$decision.next(undefined);
  }

  clearDecisions() {
    this.$decisions.next([]);
  }

  async getNextAvailableResolutionNumber(resolutionYear: number) {
    let result: number | undefined = undefined;
    try {
      result = await firstValueFrom(this.http.get<number>(`${this.url}/next-resolution-number/${resolutionYear}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch resolutionNumber');
    }
    return result;
  }
}
