import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { UpcomingMeetingBoardMapDto } from './decision-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class DecisionMeetingService {
  private url = `${environment.apiUrl}/application-decision-meeting`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<UpcomingMeetingBoardMapDto>(`${this.url}/overview/meetings`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision meetings');
    }
    return;
  }
}
