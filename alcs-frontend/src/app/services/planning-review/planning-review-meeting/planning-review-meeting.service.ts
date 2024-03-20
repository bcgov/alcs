import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  CreatePlanningReviewMeetingDto,
  PlanningReviewMeetingDto,
  PlanningReviewMeetingTypeDto,
  UpdatePlanningReviewMeetingDto,
} from './planning-review-meeting.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanningReviewMeetingService {
  private url = `${environment.apiUrl}/planning-review-meeting`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async listByPlanningReview(planningReviewUuid: string) {
    try {
      return await firstValueFrom(
        this.http.get<PlanningReviewMeetingDto[]>(`${this.url}/planning-review/${planningReviewUuid}`),
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review meetings');
    }
    return;
  }

  async create(meeting: CreatePlanningReviewMeetingDto) {
    try {
      const res = await firstValueFrom(this.http.post<PlanningReviewMeetingDto>(`${this.url}`, meeting));
      this.toastService.showSuccessToast('Planning Review meeting created');
      return res;
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create planning review meeting');
    }
    return;
  }

  async fetchTypes() {
    try {
      return await firstValueFrom(this.http.get<PlanningReviewMeetingTypeDto[]>(`${this.url}/types`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review meeting types');
    }
    return;
  }

  async update(uuid: string, updateDto: UpdatePlanningReviewMeetingDto) {
    try {
      return await firstValueFrom(this.http.patch<PlanningReviewMeetingDto>(`${this.url}/${uuid}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update planning review meeting');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      return await firstValueFrom(this.http.delete<{ success: boolean }>(`${this.url}/${uuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to delete planning review meeting');
    }
    return;
  }
}
