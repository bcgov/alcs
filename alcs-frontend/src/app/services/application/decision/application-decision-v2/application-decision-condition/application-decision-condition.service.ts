import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import {
  ApplicationDecisionConditionDateDto,
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

  async getDates(conditionUuid: string): Promise<ApplicationDecisionConditionDateDto[]> {
    try {
      return await firstValueFrom(
        this.http.get<ApplicationDecisionConditionDateDto[]>(`${this.url}/date?conditionUuid=${conditionUuid}`),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'No dates found');
      throw e;
    }
  }

  async createDate(conditionUuid: string, dateDto: ApplicationDecisionConditionDateDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationDecisionConditionDateDto>(`${this.url}/date?conditionUuid=${conditionUuid}`, dateDto),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'Failed to create date');
      throw e;
    }
  }

  async updateDate(dateUuid: string, dateDto: ApplicationDecisionConditionDateDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationDecisionConditionDateDto>(`${this.url}/date/${dateUuid}`, dateDto),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'Failed to update date');
      throw e;
    }
  }

  async deleteDate(dateUuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionConditionDateDto>(`${this.url}/date/${dateUuid}`));
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'Failed to delete date');
      throw e;
    }
  }
}
