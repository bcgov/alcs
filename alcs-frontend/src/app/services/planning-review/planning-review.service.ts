import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CreatePlanningReviewDto, PlanningReviewDto } from './planning-review.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanningReviewService {
  private url = `${environment.apiUrl}/planning-review`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async create(meeting: CreatePlanningReviewDto) {
    try {
      await firstValueFrom(this.http.post<PlanningReviewDto>(`${this.url}`, meeting));
      this.toastService.showSuccessToast('Planning meeting card created');
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
}
