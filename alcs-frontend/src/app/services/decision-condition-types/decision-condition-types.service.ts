import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDecisionConditionTypeDto } from '../application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class DecisionConditionTypesService {
  private url = `${environment.apiUrl}/decision-condition-types`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionConditionTypeDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision condition types');
    }
    return [];
  }

  async create(createDto: ApplicationDecisionConditionTypeDto) {
    try {
      return await firstValueFrom(this.http.post<ApplicationDecisionConditionTypeDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create decision condition type');
      console.log(e);
    }
    return;
  }

  async update(code: string, updateDto: ApplicationDecisionConditionTypeDto) {
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDecisionConditionTypeDto>(`${this.url}/${code}`, updateDto)
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update decision condition type');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<ApplicationDecisionConditionTypeDto>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete decision condition type');
      console.log(e);
    }
    return;
  }
}
