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
  private dateUrl = `${environment.apiUrl}/v2/application-decision-condition-dates`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchByTypeCode(typeCode: string): Promise<ApplicationDecisionConditionDto[]> {
    try {
      return await firstValueFrom(
        this.http.get<ApplicationDecisionConditionDto[]>(`${this.url}?type_code=${typeCode}`),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to load conditions');
      throw e;
    }
  }

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
        this.http.get<ApplicationDecisionConditionToComponentPlanNumberDto[]>(`${this.url}/plan-numbers/${uuid}`),
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
          planNumbers,
        ),
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
        this.http.get<ApplicationDecisionConditionDateDto[]>(`${this.dateUrl}?conditionUuid=${conditionUuid}`),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'No dates found');
      throw e;
    }
  }

  async updateDate(
    dateUuid: string,
    dateDto: ApplicationDecisionConditionDateDto,
  ): Promise<ApplicationDecisionConditionDateDto> {
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDecisionConditionDateDto>(`${this.dateUrl}/${dateUuid}`, dateDto),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'Failed to update date');
      throw e;
    }
  }

  async createDate(conditionUuid: string) {
    try {
      return await firstValueFrom(
        this.http.post<ApplicationDecisionConditionDateDto>(`${this.dateUrl}`, { conditionUuid: conditionUuid }),
      );
    } catch (e: any) {
      this.toastService.showErrorToast('Failed to create a new date');
      if (e.error.message) {
        console.error(e.error.message);
      }
      return;
    }
  }

  async deleteDate(dateUuid: string) {
    try {
      return await firstValueFrom(this.http.delete<ApplicationDecisionConditionDateDto>(`${this.dateUrl}/${dateUuid}`));
    } catch (e: any) {
      this.toastService.showErrorToast('Failed to delete the due date');
      if (e.error.message) {
        console.error(e.error.message);
      }

      return;
    }
  }
}
