import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
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
  $reconsiderations = new BehaviorSubject<UpdateApplicationReconsiderationDto[]>([]);
  private url = `${environment.apiUrl}/application-reconsideration`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(boardCode: string) {}

  async fetchByCardUuid(cardUuid: string) {
    try {
      return await firstValueFrom(this.http.get<ApplicationReconsiderationDto>(`${this.url}/card/${cardUuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch reconsideration');
    }
    return undefined;
  }

  async update(reconsideration: UpdateApplicationReconsiderationDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationReconsiderationDto>(this.url, {
          ...reconsideration,
          submittedDate: formatDateForApi(reconsideration.submittedDate),
          reviewDate: reconsideration.reviewDate ? formatDateForApi(reconsideration.reviewDate) : null,
        })
      );
      await this.fetch(reconsideration.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to update reconsideration');
    }
  }

  async create(reconsideration: CreateApplicationReconsiderationDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationReconsiderationDto>(this.url, {
          ...reconsideration,
          submittedDate: formatDateForApi(reconsideration.submittedDate),
        })
      );
      return await this.fetch(reconsideration.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to create reconsideration');
    }
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationReconsiderationDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Reconsideration deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete reconsideration');
    }
  }
}
