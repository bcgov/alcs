import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { NotificationDto, UpdateNotificationDto } from './notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private url = `${environment.apiUrl}/notification`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<NotificationDto>(`${this.url}/card/${id}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notification');
    }
    return;
  }

  async fetchByFileNumber(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<NotificationDto>(`${this.url}/${fileNumber}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notification');
    }
    return;
  }

  async update(fileNumber: string, updateDto: UpdateNotificationDto) {
    try {
      return await firstValueFrom(this.http.post<NotificationDto>(`${this.url}/${fileNumber}`, updateDto));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notification');
      return undefined;
    }
  }

  async searchByFileNumber(searchText: string) {
    try {
      return await firstValueFrom(this.http.get<NotificationDto[]>(`${this.url}/search/${searchText}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to search Notifications');
    }
    return [];
  }

  async cancel(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.post<NotificationDto>(`${this.url}/${fileNumber}/cancel`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to cancel Notification');
    }
    return;
  }

  async uncancel(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.post<NotificationDto>(`${this.url}/${fileNumber}/uncancel`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to uncancel Notification');
    }
    return;
  }

  async resendResponse(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.post<NotificationDto>(`${this.url}/${fileNumber}/resend`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to resend response for Notification');
    }
    return;
  }
}
