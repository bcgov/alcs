import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../toast/toast.service';
import {
  NoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../decision/notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionConditionService {
  private url = `${environment.apiUrl}/notice-of-intent-decision-condition`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(uuid: string, data: UpdateNoticeOfIntentDecisionConditionDto) {
    try {
      const res = await firstValueFrom(
        this.http.patch<NoticeOfIntentDecisionConditionDto>(`${this.url}/${uuid}`, data)
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
}
