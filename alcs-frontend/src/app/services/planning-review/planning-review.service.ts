import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  CreatePlanningReviewDto,
  PlanningReferralDto,
  PlanningReviewDetailedDto,
  PlanningReviewDto,
  PlanningReviewTypeDto,
  UpdatePlanningReviewDto,
} from './planning-review.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanningReviewService {
  private url = `${environment.apiUrl}/planning-review`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async create(meeting: CreatePlanningReviewDto) {
    try {
      const res = await firstValueFrom(this.http.post<PlanningReferralDto>(`${this.url}`, meeting));
      this.toastService.showSuccessToast('Planning meeting card created');
      return res;
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create planning review');
    }
    return;
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<PlanningReviewDto>(`${this.url}/card/${id}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review');
    }
    return;
  }

  async fetchTypes() {
    try {
      return await firstValueFrom(this.http.get<PlanningReviewTypeDto[]>(`${this.url}/types`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review types');
    }
    return;
  }

  async fetchDetailedByFileNumber(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<PlanningReviewDetailedDto>(`${this.url}/${fileNumber}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review');
    }
    return;
  }

  async update(fileNumber: string, updateDto: UpdatePlanningReviewDto) {
    try {
      return await firstValueFrom(this.http.post<PlanningReviewDetailedDto>(`${this.url}/${fileNumber}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update planning review');
    }
    return;
  }
}
