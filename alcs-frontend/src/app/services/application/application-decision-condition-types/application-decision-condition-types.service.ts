import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApplicationDecisionConditionTypeDto } from '../decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionConditionTypesService {
  private url = `${environment.apiUrl}/decision-condition-types`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionConditionTypeDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision condition types');
    }
    return [];
  }

  async fetchCodes() {
    try {
      return await firstValueFrom(this.http.get<string[]>(`${this.url}/codes`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision condition type codes');
    }
    return [];
  }

  async create(createDto: ApplicationDecisionConditionTypeDto) {
    try {
      return await firstValueFrom(this.http.post<ApplicationDecisionConditionTypeDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create decision condition type');
      console.error(e);
    }
    return;
  }

  async update(code: string, updateDto: ApplicationDecisionConditionTypeDto) {
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDecisionConditionTypeDto>(`${this.url}/${code}`, updateDto),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update decision condition type');
      console.error(e);
    }
    return;
  }

  async delete(code: string): Promise<ApplicationDecisionConditionTypeDto | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApplicationDecisionConditionTypeDto>(`${this.url}/${code}`),
      );
      this.toastService.showSuccessToast('Condition successfully deleted.');
      return response;
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
