import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from '../application/application.dto';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDto, NoticeOfIntentSubtypeDto, UpdateNoticeOfIntentDto } from './notice-of-intent.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentService {
  private url = `${environment.apiUrl}/notice-of-intent`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async listSubtypes() {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentSubtypeDto[]>(`${this.url}/types`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notice of Intent Subtypes');
    }
    return [];
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDto>(`${this.url}/card/${id}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notice of Intent');
    }
    return;
  }

  async fetchByFileNumber(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDto>(`${this.url}/${fileNumber}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notice of Intent');
    }
    return;
  }

  async update(fileNumber: string, updateDto: UpdateNoticeOfIntentDto) {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDto>(`${this.url}/${fileNumber}`, updateDto));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notice of Intent');
      return undefined;
    }
  }

  async searchByFileNumber(searchText: string) {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDto[]>(`${this.url}/search/${searchText}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to search Notice of Intents');
    }
    return [];
  }

  async cancel(fileNumber: string, sendEmail: boolean = true) {
    try {
      return await firstValueFrom(this.http.post<ApplicationDto>(`${this.url}/${fileNumber}/cancel?sendEmail=${sendEmail}`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to cancel Notice of Intent');
    }
    return;
  }

  async uncancel(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.post<ApplicationDto>(`${this.url}/${fileNumber}/uncancel`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to uncancel Notice of Intent');
    }
    return;
  }
}
