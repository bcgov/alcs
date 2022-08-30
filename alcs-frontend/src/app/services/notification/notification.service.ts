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

  fetchMyNotifications() {
    return firstValueFrom(this.http.get<NotificationDto[]>(`${environment.apiUrl}/notification`));
  }

  markRead(uuid: string) {
    return firstValueFrom(this.http.post<void>(`${environment.apiUrl}/notification/${uuid}`, {}));
  }

  markAllRead() {
    return firstValueFrom(this.http.post<void>(`${environment.apiUrl}/notification`, {}));
  }
}
