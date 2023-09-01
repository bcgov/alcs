import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageDto } from './message.dto';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}

  fetchMyNotifications() {
    return firstValueFrom(this.http.get<MessageDto[]>(`${environment.apiUrl}/message`));
  }

  markRead(uuid: string) {
    return firstValueFrom(this.http.post<void>(`${environment.apiUrl}/message/${uuid}`, {}));
  }

  markAllRead() {
    return firstValueFrom(this.http.post<void>(`${environment.apiUrl}/message`, {}));
  }
}
