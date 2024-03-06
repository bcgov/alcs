import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  CreatePlanningReviewDto,
  PlanningReferralDto,
  PlanningReviewDto,
  PlanningReviewTypeDto,
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
}
