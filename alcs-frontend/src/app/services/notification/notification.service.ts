import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto } from './notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  async fetchMyNotifications() {
    return await firstValueFrom(this.http.get<NotificationDto[]>(`${environment.apiRoot}/notification`));
  }

  async markRead(uuid: string) {
    return await firstValueFrom(this.http.post<void>(`${environment.apiRoot}/notification/${uuid}`, {}));
  }

  async markAllRead() {
    return await firstValueFrom(this.http.post<void>(`${environment.apiRoot}/notification`, {}));
  }
}
