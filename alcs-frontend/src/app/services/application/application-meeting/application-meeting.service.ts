import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
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

  async update(meeting: UpdateApplicationMeetingDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationMeetingDto>(this.url, {
          ...meeting,
          startDate: meeting.startDate.valueOf(),
          endDate: meeting.endDate.valueOf(),
        })
      );
      await this.fetch(meeting.applicationFileNumber);
      this.toastService.showSuccessToast('Meeting updated.');
    } catch (e) {
      this.toastService.showErrorToast('Failed to update meeting');
    }
  }

  async create(meeting: CreateApplicationMeetingDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationMeetingDto>(this.url, {
          ...meeting,
          startDate: dayjs(meeting.startDate).startOf('day').add(12, 'hours').valueOf(),
          endDate: dayjs(meeting.endDate).startOf('day').add(12, 'hours').valueOf(),
        })
      );
      this.toastService.showSuccessToast('Meeting created.');
      return await this.fetch(meeting.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to create meeting');
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
