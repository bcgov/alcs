import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationModificationCreateDto,
  ApplicationModificationDto,
  ApplicationModificationUpdateDto,
} from './application-modification.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationModificationService {
  $modifications = new BehaviorSubject<ApplicationModificationDto[]>([]);

  private url = `${environment.apiUrl}/application-modification`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(applicationFileNumber: string) {
    try {
      this.clearModifications();

      const modifications = await firstValueFrom(
        this.http.get<ApplicationModificationDto[]>(`${this.url}/application/${applicationFileNumber}`)
      );
      modifications.sort((a, b) => b.submittedDate - a.submittedDate);
      this.$modifications.next(modifications);
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch modifications');
    }
    return [];
  }

  async fetchByCardUuid(cardUuid: string) {
    try {
      return await firstValueFrom(this.http.get<ApplicationModificationDto>(`${this.url}/card/${cardUuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch modification');
    }
    return;
  }

  async update(uuid: string, updateDto: ApplicationModificationUpdateDto) {
    try {
      return await firstValueFrom(this.http.patch<ApplicationModificationDto>(`${this.url}/${uuid}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update modification');
    }
    return;
  }

  async create(createDto: ApplicationModificationCreateDto) {
    try {
      return await firstValueFrom(
        this.http.post<ApplicationModificationDto>(this.url, {
          ...createDto,
          submittedDate: formatDateForApi(createDto.submittedDate),
        })
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create modification');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationModificationDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Modification deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete modification');
    }
  }

  async clearModifications() {
    console.log('clear mod');
    this.$modifications.next([]);
  }
}
