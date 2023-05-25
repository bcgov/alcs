import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CreateNoticeOfIntentDto, NoticeOfIntentDto } from './notice-of-intent.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentService {
  private url = `${environment.apiUrl}/notice-of-intent`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async create(createDto: CreateNoticeOfIntentDto) {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDto>(`${this.url}`, createDto));
    } catch (e) {
      console.error(e);
      if (e instanceof HttpErrorResponse && e.status === 400) {
        this.toastService.showErrorToast(`Covenant or Application with File ID ${createDto.fileNumber} already exists`);
      } else {
        this.toastService.showErrorToast('Failed to create Covenant');
      }
      throw e;
    }
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDto>(`${this.url}/card/${id}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch covenant');
    }
    return;
  }
}
