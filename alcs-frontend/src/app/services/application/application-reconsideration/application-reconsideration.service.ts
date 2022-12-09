import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationReconsiderationDto,
  CreateApplicationReconsiderationDto,
  UpdateApplicationReconsiderationDto,
} from './application-reconsideration.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationReconsiderationService {
  $reconsiderations = new BehaviorSubject<ApplicationReconsiderationDto[]>([]);
  $codes = new BehaviorSubject<BaseCodeDto[]>([]);

  private url = `${environment.apiUrl}/application-reconsideration`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(applicationFileNumber: string) {
    try {
      const reconsiderations = await firstValueFrom(
        this.http.get<ApplicationReconsiderationDto[]>(`${this.url}/application/${applicationFileNumber}`)
      );
      reconsiderations.sort((a, b) => b.submittedDate - a.submittedDate);
      this.$reconsiderations.next(reconsiderations);
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch reconsiderations');
    }
  }

  async fetchByCardUuid(cardUuid: string) {
    try {
      return await firstValueFrom(this.http.get<ApplicationReconsiderationDto>(`${this.url}/card/${cardUuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch reconsideration');
    }
    return;
  }

  async update(reconsiderationUuid: string, reconsideration: UpdateApplicationReconsiderationDto) {
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationReconsiderationDto>(`${this.url}/${reconsiderationUuid}`, reconsideration)
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update reconsideration');
    }
    return undefined;
  }

  async create(reconsideration: CreateApplicationReconsiderationDto) {
    try {
      return await firstValueFrom(
        this.http.post<ApplicationReconsiderationDto>(this.url, {
          ...reconsideration,
          submittedDate: formatDateForApi(reconsideration.submittedDate),
        })
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create reconsideration');
    }
    return undefined;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationReconsiderationDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Reconsideration deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete reconsideration');
    }
  }

  async fetchCodes() {
    try {
      const codes = await firstValueFrom(this.http.get<BaseCodeDto[]>(`${this.url}/codes`));
      this.$codes.next(codes);
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch reconsideration codes');
    }
  }
}
