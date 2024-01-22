import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../toast/toast.service';
import {
  NoticeOfIntentDecisionComponentDto,
  UpdateNoticeOfIntentDecisionComponentDto,
} from '../../decision/notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionComponentService {
  private url = `${environment.apiUrl}/notice-of-intent-decision-component`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(uuid: string, data: UpdateNoticeOfIntentDecisionComponentDto) {
    try {
      const res = await firstValueFrom(
        this.http.patch<NoticeOfIntentDecisionComponentDto>(`${this.url}/${uuid}`, data)
      );
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
}
