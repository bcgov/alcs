import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationDecisionMeetingDto, CreateApplicationDecisionMeetingDto } from './application-decision-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionMeetingService {
  public $decisionMeetings = new BehaviorSubject<ApplicationDecisionMeetingDto[]>([]);
  private url = `${environment.apiRoot}/application-decision-meeting`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(fileNumber: string) {
    let meetings = [] as ApplicationDecisionMeetingDto[];

    try {
      meetings = await firstValueFrom(this.http.get<ApplicationDecisionMeetingDto[]>(`${this.url}/${fileNumber}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision meetings');
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
      this.toastService.showErrorToast('Failed to update decision meeting');
    }
  }

  async create(decisionMeeting: CreateApplicationDecisionMeetingDto) {
    let meeting;
    try {
      meeting = await firstValueFrom(
        this.http.post<ApplicationDecisionMeetingDto>(this.url, {
          ...decisionMeeting,
          date: dayjs(decisionMeeting.date).startOf('day').add(12, 'hours').valueOf(),
        })
      );
      await this.fetch(decisionMeeting.applicationFileNumber);
    } catch (e) {
      this.toastService.showErrorToast('Failed to create decision meeting');
    }

    return meeting;
  }

  async fetchOne(uuid: string) {
    let meeting = {} as ApplicationDecisionMeetingDto;

    try {
      meeting = await firstValueFrom(this.http.get<ApplicationDecisionMeetingDto>(`${this.url}/meeting/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision meetings');
    }

    return meeting;
  }

  async delete(uuid: string) {
    let meeting = {} as ApplicationDecisionMeetingDto;

    try {
      meeting = await firstValueFrom(this.http.delete<ApplicationDecisionMeetingDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Meeting deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }

    return meeting;
  }
}
