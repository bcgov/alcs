import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  CreateNoticeOfIntentMeetingDto,
  NoticeOfIntentMeetingDto,
  UpdateNoticeOfIntentMeetingDto,
} from './notice-of-intent-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentMeetingService {
  $meetings = new BehaviorSubject<NoticeOfIntentMeetingDto[]>([]);
  private url = `${environment.apiUrl}/notice-of-intent-meeting`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(uuid: string) {
    let meetings: NoticeOfIntentMeetingDto[] = [];

    try {
      meetings = await firstValueFrom(this.http.get<NoticeOfIntentMeetingDto[]>(`${this.url}/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch meetings');
    }

    this.$meetings.next(meetings);
  }

  async update(uuid: string, typeLabel: string, meeting: UpdateNoticeOfIntentMeetingDto) {
    try {
      await firstValueFrom(
        this.http.patch<NoticeOfIntentMeetingDto>(`${this.url}/${uuid}`, {
          ...meeting,
          meetingStartDate: meeting.meetingStartDate
            ? formatDateForApi(meeting.meetingStartDate)
            : meeting.meetingStartDate,
          meetingEndDate: meeting.meetingEndDate ? formatDateForApi(meeting.meetingEndDate) : meeting.meetingEndDate,
        })
      );
      this.toastService.showSuccessToast(`${typeLabel} updated`);
    } catch (e) {
      this.toastService.showErrorToast(`Failed to update ${typeLabel}`);
    }
  }

  async create(uuid: string, typeLabel: string, meeting: CreateNoticeOfIntentMeetingDto) {
    try {
      await firstValueFrom(
        this.http.post<NoticeOfIntentMeetingDto>(`${this.url}/${uuid}`, {
          ...meeting,
          meetingStartDate: formatDateForApi(meeting.meetingStartDate),
          meetingEndDate: meeting.meetingEndDate ? formatDateForApi(meeting.meetingEndDate) : undefined,
        })
      );
      this.toastService.showSuccessToast(`${typeLabel} created`);
    } catch (e) {
      this.toastService.showErrorToast(`Failed to create ${typeLabel}`);
    }
  }

  async fetchOne(uuid: string) {
    return firstValueFrom(this.http.get<NoticeOfIntentMeetingDto>(`${this.url}/meeting/${uuid}`));
  }

  async delete(uuid: string, typeLabel: string) {
    try {
      await firstValueFrom(this.http.delete<NoticeOfIntentMeetingDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast(`${typeLabel} deleted`);
    } catch (err) {
      this.toastService.showErrorToast(`Failed to delete ${typeLabel}`);
    }
  }
}
