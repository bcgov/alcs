import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../toast/toast.service';
import { DecisionComponentDto } from './application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionComponentService {
  private url = `${environment.apiUrl}/v2/application-decision-component`;
  
  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(uuid: string, data: DecisionComponentDto) {
    try {
      const res = await firstValueFrom(this.http.patch<DecisionComponentDto>(`${this.url}/${uuid}`, data));
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
