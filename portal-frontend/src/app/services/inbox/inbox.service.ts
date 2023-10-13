import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationStatusDto } from '../application-submission/application-submission.dto';
import { ToastService } from '../toast/toast.service';
import {
  InboxResponseDto,
  BaseInboxResultDto,
  NoticeOfIntentInboxResultDto,
  NotificationInboxResultDto,
  InboxRequestDto,
  InboxSearchResponseDto,
} from './inbox.dto';

@Injectable({
  providedIn: 'root',
})
export class InboxService {
  private baseUrl = `${environment.apiUrl}/inbox`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async search(searchDto: InboxRequestDto) {
    try {
      return await firstValueFrom(this.http.post<InboxSearchResponseDto>(`${this.baseUrl}`, searchDto));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Failed to load inbox. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchApplications(searchDto: InboxRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<InboxResponseDto<BaseInboxResultDto>>(`${this.baseUrl}/application`, searchDto)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Failed to load Applications. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchNoticeOfIntents(searchDto: InboxRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<InboxResponseDto<NoticeOfIntentInboxResultDto>>(`${this.baseUrl}/notice-of-intent`, searchDto)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Failed to load Notices of Intent. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchNotifications(searchDto: InboxRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<InboxResponseDto<NotificationInboxResultDto>>(`${this.baseUrl}/notifications`, searchDto)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Failed to load Notifications. Please refresh the page and try again`);
      return undefined;
    }
  }

  async listStatuses() {
    try {
      return await firstValueFrom(
        this.http.get<{
          application: ApplicationStatusDto[];
          noticeOfIntent: ApplicationStatusDto[];
          notification: ApplicationStatusDto[];
        }>(`${this.baseUrl}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Failed to load Statuses. Please refresh the page and try again`);
      return undefined;
    }
  }
}
