import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  CreateNoticeOfIntentDto,
  NoticeOfIntentDto,
  NoticeOfIntentSubtypeDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentService {
  private url = `${environment.apiUrl}/notice-of-intent`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async listSubtypes() {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentSubtypeDto[]>(`${this.url}/types`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Notice of Intent Subtypes');
    }
    return [];
  }

  async create(createDto: CreateNoticeOfIntentDto) {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDto>(`${this.url}`, createDto));
    } catch (e) {
      console.error(e);
      if (e instanceof HttpErrorResponse && e.status === 400) {
        this.toastService.showErrorToast(
          `Covenant/Application/NOI with File ID ${createDto.fileNumber} already exists`
        );
      } else {
        this.toastService.showErrorToast('Failed to create Notice of Intent');
      }
      throw e;
    }
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
      this.toastService.showErrorToast('Failed to create Notice of Intent');
      return undefined;
    }
  }
}
