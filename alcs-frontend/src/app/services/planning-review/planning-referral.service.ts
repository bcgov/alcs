import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  CreatePlanningReferralDto,
  CreatePlanningReviewDto,
  PlanningReferralDto,
  PlanningReviewDto,
  PlanningReviewTypeDto,
  UpdatePlanningReferralDto,
} from './planning-review.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanningReferralService {
  private url = `${environment.apiUrl}/planning-referral`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<PlanningReferralDto>(`${this.url}/card/${id}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch planning review');
    }
    return;
  }

  async create(createDto: CreatePlanningReferralDto) {
    try {
      return await firstValueFrom(this.http.post<PlanningReferralDto>(`${this.url}`, createDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create planning review');
    }
    return;
  }

  async update(uuid: string, updateDto: UpdatePlanningReferralDto) {
    try {
      return await firstValueFrom(this.http.patch<PlanningReferralDto>(`${this.url}/${uuid}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update planning review');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      return await firstValueFrom(this.http.delete<PlanningReferralDto>(`${this.url}/${uuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to delete planning review');
    }
    return;
  }
}
