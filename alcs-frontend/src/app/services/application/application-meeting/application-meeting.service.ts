import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
  UpdateApplicationMeetingDto,
} from './application-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationMeetingService {
  $meetings = new BehaviorSubject<ApplicationMeetingDto[]>([]);
  private url = `${environment.apiUrl}/application-meeting`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(fileNumber: string) {
    let meetings: ApplicationMeetingDto[] = [];

    try {
      meetings = await firstValueFrom(this.http.get<ApplicationMeetingDto[]>(`${this.url}/${fileNumber}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch meetings');
    }

    this.$meetings.next(meetings);
  }

  async update(uuid: string, meeting: UpdateApplicationMeetingDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationMeetingDto>(`${this.url}/${uuid}`, {
          ...meeting,
          meetingStartDate: meeting.meetingStartDate
            ? formatDateForApi(meeting.meetingStartDate)
            : meeting.meetingStartDate,
          meetingEndDate: meeting.meetingEndDate ? formatDateForApi(meeting.meetingEndDate) : meeting.meetingEndDate,
          reportStartDate: meeting.reportStartDate
            ? formatDateForApi(meeting.reportStartDate)
            : meeting.reportStartDate,
          reportEndDate: meeting.reportEndDate ? formatDateForApi(meeting.reportEndDate) : meeting.reportEndDate,
        })
      );
      this.toastService.showSuccessToast('Meeting updated.');
    } catch (e) {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }

  async create(fileNumber: string, typeLabel: string, meeting: CreateApplicationMeetingDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationMeetingDto>(`${this.url}/${fileNumber}`, {
          ...meeting,
          meetingStartDate: formatDateForApi(meeting.meetingStartDate),
        })
      );
      this.toastService.showSuccessToast('Meeting created.');
    } catch (e) {
      this.toastService.showErrorToast(`Failed to create ${typeLabel}`);
    }
  }

  fetchOne(uuid: string) {
    try {
      return firstValueFrom(this.http.get<ApplicationMeetingDto>(`${this.url}/meeting/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch meetings');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationMeetingDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Meeting deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }
  }
}
