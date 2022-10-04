import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationDecisionDto,
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';

export const OUTCOMES = ['Approved', 'Approved Alternate', 'Refused'];

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionService {
  private url = `${environment.apiUrl}/application-decision`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(fileNumber: string) {
    let decisions: ApplicationDecisionDto[] = [];

    try {
      decisions = await firstValueFrom(
        this.http.get<ApplicationDecisionDto[]>(`${this.url}/application/${fileNumber}`)
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return decisions;
  }

  async update(uuid: string, data: UpdateApplicationDecisionDto) {
    try {
      await firstValueFrom(this.http.patch<ApplicationDecisionDto>(`${this.url}/${uuid}`, data));
      this.toastService.showSuccessToast('Meeting updated.');
    } catch (e) {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }

  async create(decision: CreateApplicationDecisionDto) {
    try {
      await firstValueFrom(this.http.post<ApplicationDecisionDto>(`${this.url}`, decision));
      this.toastService.showSuccessToast('Meeting created.');
    } catch (e) {
      this.toastService.showErrorToast(`Failed to create decision`);
    }
  }

  fetchOne(uuid: string) {
    try {
      return firstValueFrom(this.http.get<ApplicationDecisionDto>(`${this.url}/meeting/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch meetings');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Meeting deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }
  }
}
