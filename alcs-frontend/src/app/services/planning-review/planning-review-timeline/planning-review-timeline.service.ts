import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { TimelineEventDto } from './planning-review-timeline.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanningReviewTimelineService {
  private url = `${environment.apiUrl}/planning-review-timeline`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchByFileNumber(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<TimelineEventDto[]>(`${this.url}/${fileNumber}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch timeline events');
    }
    return [];
  }
}
