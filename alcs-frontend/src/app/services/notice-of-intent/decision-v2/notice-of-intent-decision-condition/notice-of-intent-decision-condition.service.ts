import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../toast/toast.service';
import {
  NoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionConditionService {
  private url = `${environment.apiUrl}/notice-of-intent-decision-condition`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchByTypeCode(typeCode: string): Promise<NoticeOfIntentDecisionConditionDto[]> {
    try {
      return await firstValueFrom(
        this.http.get<NoticeOfIntentDecisionConditionDto[]>(`${this.url}?type_code=${typeCode}`),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to load conditions');
      throw e;
    }
  }

  async update(uuid: string, data: UpdateNoticeOfIntentDecisionConditionDto) {
    try {
      const res = await firstValueFrom(
        this.http.patch<NoticeOfIntentDecisionConditionDto>(`${this.url}/${uuid}`, data),
      );
      this.toastService.showSuccessToast('Condition updated');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to update condition');
      }
      throw e;
    }
  }

  async getDates(conditionUuid: string): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    try {
      return await firstValueFrom(
        this.http.get<NoticeOfIntentDecisionConditionDateDto[]>(`${this.url}/date?conditionUuid=${conditionUuid}`),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'No dates found');
      throw e;
    }
  }

  async updateDate(
    dateUuid: string,
    dateDto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDateDto> {
    try {
      return await firstValueFrom(
        this.http.patch<NoticeOfIntentDecisionConditionDateDto>(`${this.url}/date/${dateUuid}`, dateDto),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'Failed to update date');
      throw e;
    }
  }
}
