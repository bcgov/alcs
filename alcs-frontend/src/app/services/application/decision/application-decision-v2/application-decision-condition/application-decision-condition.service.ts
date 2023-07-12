import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import { ApplicationDecisionConditionDto, UpdateApplicationDecisionConditionDto } from '../application-decision-v2.dto';

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
}
