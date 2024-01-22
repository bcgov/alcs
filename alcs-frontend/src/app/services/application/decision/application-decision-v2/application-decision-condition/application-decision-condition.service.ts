import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionConditionToComponentPlanNumberDto,
  UpdateApplicationDecisionConditionDto,
} from '../application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionConditionService {
  private url = `${environment.apiUrl}/v2/application-decision-condition`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(uuid: string, data: UpdateApplicationDecisionConditionDto) {
    try {
      const res = await firstValueFrom(this.http.patch<ApplicationDecisionConditionDto>(`${this.url}/${uuid}`, data));
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

  async fetchPlanNumbers(uuid: string) {
    try {
      const res = await firstValueFrom(
        this.http.get<ApplicationDecisionConditionToComponentPlanNumberDto[]>(`${this.url}/plan-numbers/${uuid}`)
      );
      return res;
    } catch (e) {
      this.toastService.showErrorToast('Failed to load plan numbers');
      throw e;
    }
  }

  async updatePlanNumbers(conditionUuid: string, componentUuid: string, planNumbers: string | null) {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApplicationDecisionConditionDto>(
          `${this.url}/plan-numbers/condition/${conditionUuid}/component/${componentUuid}`,
          planNumbers
        )
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
