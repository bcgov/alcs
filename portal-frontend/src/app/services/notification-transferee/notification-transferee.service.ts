import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  NotificationTransfereeCreateDto,
  NotificationTransfereeDto,
  NotificationTransfereeUpdateDto,
} from './notification-transferee.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationTransfereeService {
  private serviceUrl = `${environment.apiUrl}/notification-transferee`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}
  async fetchBySubmissionId(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NotificationTransfereeDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Transferees, please try again later');
    }
    return undefined;
  }

  async create(dto: NotificationTransfereeCreateDto) {
    try {
      const res = await firstValueFrom(this.httpClient.post<NotificationTransfereeDto>(`${this.serviceUrl}`, dto));
      this.toastService.showSuccessToast('Transferee created');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Transferee, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: NotificationTransfereeUpdateDto) {
    try {
      const res = await firstValueFrom(
        this.httpClient.patch<NotificationTransfereeDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('Transferee saved');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Transferee, please try again later');
      return undefined;
    }
  }
  async delete(uuid: string) {
    try {
      const result = await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}/${uuid}`));
      this.toastService.showSuccessToast('Transferees deleted');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete Transferee, please try again');
    }
    return undefined;
  }

  sortOwners(a: NotificationTransfereeDto, b: NotificationTransfereeDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
  }
}
