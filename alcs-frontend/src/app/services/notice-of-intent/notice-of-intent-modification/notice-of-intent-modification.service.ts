import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentModificationService {
  $modifications = new BehaviorSubject<NoticeOfIntentModificationDto[]>([]);

  private url = `${environment.apiUrl}/notice-of-intent-modification`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByFileNumber(fileNumber: string) {
    try {
      const modifications = await firstValueFrom(
        this.http.get<NoticeOfIntentModificationDto[]>(`${this.url}/notice-of-intent/${fileNumber}`)
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
      return await firstValueFrom(this.http.get<NoticeOfIntentModificationDto>(`${this.url}/card/${cardUuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch modification');
    }
    return;
  }

  async update(uuid: string, updateDto: NoticeOfIntentModificationUpdateDto) {
    try {
      return await firstValueFrom(this.http.patch<NoticeOfIntentModificationDto>(`${this.url}/${uuid}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update modification');
    }
    return;
  }

  async create(createDto: NoticeOfIntentModificationCreateDto) {
    try {
      return await firstValueFrom(
        this.http.post<NoticeOfIntentModificationDto>(this.url, {
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
      await firstValueFrom(this.http.delete<NoticeOfIntentModificationDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Modification deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete modification');
    }
  }
}
