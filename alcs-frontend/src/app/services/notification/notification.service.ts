import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingsService } from '../settings/settings.service';
import { NotificationDto } from './notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient, private settingsService: SettingsService) {}

  fetchMyNotifications() {
    return firstValueFrom(this.http.get<NotificationDto[]>(`${this.settingsService.settings.apiUrl}/notification`));
  }

  markRead(uuid: string) {
    return firstValueFrom(this.http.post<void>(`${this.settingsService.settings.apiUrl}/notification/${uuid}`, {}));
  }

  markAllRead() {
    return firstValueFrom(this.http.post<void>(`${this.settingsService.settings.apiUrl}/notification`, {}));
  }
}
