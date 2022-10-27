import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationAmendmentDto } from '../application/application-amendment/application-amendment.dto';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';
import { HomepageSubtaskDto } from '../card/card-subtask/card-subtask.dto';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  async fetchAssignedToMe() {
    return await firstValueFrom(
      this.http.get<{
        applications: ApplicationDto[];
        reconsiderations: ApplicationReconsiderationDto[];
        planningReviews: PlanningReviewDto[];
        amendments: ApplicationAmendmentDto[];
      }>(`${environment.apiUrl}/home/assigned`)
    );
  }

  async fetchGisSubtasks() {
    return await firstValueFrom(this.http.get<HomepageSubtaskDto[]>(`${environment.apiUrl}/home/subtask`));
  }
}
