import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { UpcomingMeetingBoardMapDto, UpcomingMeetingDto } from './decision-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class DecisionMeetingService {
  private url = `${environment.apiUrl}/decision-meeting`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetch(fileNumber?: string) {
    if (fileNumber !== undefined) {
      try {
        const meetings = await firstValueFrom(this.http.get<UpcomingMeetingDto[]>(`${this.url}/${fileNumber}`));
        const record: UpcomingMeetingBoardMapDto = { all: meetings };
        return record;
      } catch (err) {
        this.toastService.showErrorToast('Failed to fetch scheduled discussions');
      }
    }
    try {
      return await firstValueFrom(this.http.get<UpcomingMeetingBoardMapDto>(`${this.url}/overview/meetings`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch scheduled discussions');
    }
    return;
  }
}
