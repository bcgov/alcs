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
      this.toastService.showErrorToast('Failed to fetch review meetings');
    }

    this.$decisionMeetings.next(meetings);
  }

  async update(decisionMeeting: ApplicationDecisionMeetingDto) {
    try {
      await firstValueFrom(
        this.http.patch<ApplicationDecisionMeetingDto>(this.url, {
          ...decisionMeeting,
          date: decisionMeeting.date.valueOf(),
        })
      );
      await this.fetch(decisionMeeting.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to update review meeting');
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
      this.toastService.showErrorToast('Failed to create review meeting');
    }
  }

  fetchOne(uuid: string) {
    try {
      return firstValueFrom(this.http.get<ApplicationDecisionMeetingDto>(`${this.url}/meeting/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch review meeting');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionMeetingDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Meeting deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }
  }
}
