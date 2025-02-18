import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  CreateNoticeOfIntentDecisionConditionCardDto,
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionCardDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from '../../notice-of-intent-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionConditionCardService {
  $conditionCards = new BehaviorSubject<NoticeOfIntentDecisionConditionCardDto[]>([]);

  private url = `${environment.apiUrl}/notice-of-intent-decision-condition-card`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async get(uuid: string): Promise<NoticeOfIntentDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDecisionConditionCardDto>(`${this.url}/${uuid}`));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch NOI Decision Condition Card');
    }
    return;
  }

  async create(
    dto: CreateNoticeOfIntentDecisionConditionCardDto,
  ): Promise<NoticeOfIntentDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDecisionConditionCardDto>(this.url, dto));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create NOI Decision Condition Card');
    }
    return;
  }

  async update(
    uuid: string,
    dto: UpdateNoticeOfIntentDecisionConditionCardDto,
  ): Promise<NoticeOfIntentDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.patch<NoticeOfIntentDecisionConditionCardDto>(`${this.url}/${uuid}`, dto));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update NOI Decision Condition Card');
    }
    return;
  }

  async getByCard(uuid: string): Promise<NoticeOfIntentDecisionConditionCardBoardDto | undefined> {
    try {
      return await firstValueFrom(
        this.http.get<NoticeOfIntentDecisionConditionCardBoardDto>(`${this.url}/board-card/${uuid}`),
      );
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch NOI Decision Condition Card by Card');
    }
    return;
  }

  async fetchByNoticeOfIntentFileNumber(fileNumber: string): Promise<void> {
    try {
      this.clearConditionCards();

      const conditionCards = await firstValueFrom(
        this.http.get<NoticeOfIntentDecisionConditionCardDto[]>(`${this.url}/noi/${fileNumber}`),
      );
      this.$conditionCards.next(conditionCards);
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch NOI Decision Condition Cards by Application File Number');
    }
    return;
  }

  clearConditionCards() {
    this.$conditionCards.next([]);
  }
}
