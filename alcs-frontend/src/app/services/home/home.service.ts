import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationModificationDto } from '../application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';
import { CARD_SUBTASK_TYPE, HomepageSubtaskDto } from '../card/card-subtask/card-subtask.dto';
import { CovenantDto } from '../covenant/covenant.dto';
import { NoticeOfIntentModificationDto } from '../notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
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
        modifications: ApplicationModificationDto[];
        covenants: CovenantDto[];
        noticeOfIntents: NoticeOfIntentDto[];
        noticeOfIntentModifications: NoticeOfIntentModificationDto[];
      }>(`${environment.apiUrl}/home/assigned`)
    );
  }

  async fetchSubtasks(subtaskType: CARD_SUBTASK_TYPE) {
    return await firstValueFrom(
      this.http.get<HomepageSubtaskDto[]>(`${environment.apiUrl}/home/subtask/${subtaskType}`)
    );
  }
}
