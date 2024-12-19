import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NoticeOfIntentDecisionConditionTypeDto } from '../decision-v2/notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeofIntentDecisionConditionTypesService {
  private url = `${environment.apiUrl}/noi-decision-condition-types`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDecisionConditionTypeDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision condition types');
    }
    return [];
  }

  async fetchCodesWithDeleted() {
    try {
      return await firstValueFrom(this.http.get<string[]>(`${this.url}/codes`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision condition type codes');
    }
    return [];
  }

  async create(createDto: NoticeOfIntentDecisionConditionTypeDto) {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDecisionConditionTypeDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create decision condition type');
      console.error(e);
    }
    return;
  }

  async update(code: string, updateDto: NoticeOfIntentDecisionConditionTypeDto) {
    try {
      const updatedDecisionConditionType = await firstValueFrom(
        this.http.patch<NoticeOfIntentDecisionConditionTypeDto>(`${this.url}/${code}`, updateDto),
      );

      if (updatedDecisionConditionType) {
        this.toastService.showSuccessToast('Condition type updated successfully');
      }

      return updatedDecisionConditionType;
    } catch (e) {
      this.toastService.showErrorToast('Failed to update decision condition type');
      console.error(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<NoticeOfIntentDecisionConditionTypeDto>(`${this.url}/${code}`));
    } catch (e: any) {
      if (e && e.error && e.error.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to delete decision condition type');
      }
      console.error(e);
    }
    return;
  }
}
