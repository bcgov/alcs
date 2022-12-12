import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import { ApplicationDecisionMeetingDto, CreateApplicationDecisionMeetingDto } from './application-decision-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionMeetingService {
  $decisionMeetings = new BehaviorSubject<ApplicationDecisionMeetingDto[]>([]);
  private url = `${environment.apiUrl}/application-decision-meeting`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(fileNumber: string) {
    let meetings: ApplicationDecisionMeetingDto[] = [];

    try {
      meetings = await firstValueFrom(this.http.get<ApplicationDecisionMeetingDto[]>(`${this.url}/${fileNumber}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch discussion schedule');
    }

    this.$decisionMeetings.next(meetings);
  }

  async update(decisionMeeting: ApplicationDecisionMeetingDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationDecisionMeetingDto>(this.url, {
          ...decisionMeeting,
          date: formatDateForApi(decisionMeeting.date),
        })
      );
      await this.fetch(decisionMeeting.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to update scheduled discussion');
    }
  }

  async create(decisionMeeting: CreateApplicationDecisionMeetingDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationDecisionMeetingDto>(this.url, {
          ...decisionMeeting,
          date: formatDateForApi(decisionMeeting.date),
        })
      );
      return await this.fetch(decisionMeeting.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to create scheduled discussion');
    }
  }

  fetchOne(uuid: string) {
    return firstValueFrom(this.http.get<ApplicationDecisionMeetingDto>(`${this.url}/meeting/${uuid}`));
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionMeetingDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Discussion deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to scheduled discussion');
    }
  }
}
