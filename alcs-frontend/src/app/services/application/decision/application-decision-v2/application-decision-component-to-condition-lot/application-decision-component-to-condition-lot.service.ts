import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import { ApplicationDecisionComponentToConditionLotDto } from '../application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionComponentToConditionLotService {
  private url = `${environment.apiUrl}/v2/application-condition-to-component-lot`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(componentLotUuid: string, conditionUuid: string, planNumbers: string | null) {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApplicationDecisionComponentToConditionLotDto>(
          `${this.url}/condition/${conditionUuid}/component-lot/${componentLotUuid}`,
          planNumbers
        )
      );
      this.toastService.showSuccessToast('Lot updated');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to update lot');
      }
      throw e;
    }
  }

  async fetchConditionLots(conditionUuid: string, componentUuid: string) {
    try {
      const res = await firstValueFrom(
        this.http.get<ApplicationDecisionComponentToConditionLotDto[]>(
          `${this.url}/component/${componentUuid}/condition/${conditionUuid}`
        )
      );
      return res;
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch condition lots');
      throw e;
    }
  }
}
