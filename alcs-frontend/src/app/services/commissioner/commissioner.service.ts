import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommissionerApplicationDto, CommissionerPlanningReviewDto } from './commissioner.dto';

@Injectable({
  providedIn: 'root',
})
export class CommissionerService {
  private baseUrl = `${environment.apiUrl}/commissioner`;

  constructor(private http: HttpClient) {}

  async fetchApplication(fileNumber: string): Promise<CommissionerApplicationDto> {
    return firstValueFrom(this.http.get<CommissionerApplicationDto>(`${this.baseUrl}/${fileNumber}`));
  }

  async fetchPlanningReview(fileNumber: string): Promise<CommissionerPlanningReviewDto> {
    return firstValueFrom(
      this.http.get<CommissionerPlanningReviewDto>(`${this.baseUrl}/planning-review/${fileNumber}`),
    );
  }
}
