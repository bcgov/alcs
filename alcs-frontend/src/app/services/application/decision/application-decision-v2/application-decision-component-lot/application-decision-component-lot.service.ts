import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import { ProposedDecisionLotDto } from '../application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionComponentLotService {
  private url = `${environment.apiUrl}/v2/application-decision-component-lot`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async update(uuid: string, data: ProposedDecisionLotDto) {
    try {
      const res = await firstValueFrom(this.http.patch<ProposedDecisionLotDto>(`${this.url}/${uuid}`, data));
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
}
