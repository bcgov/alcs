import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from '../../application-decision-v2.dto';
import { ToastService } from '../../../../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionConditionCardService {
  $conditionCards = new BehaviorSubject<ApplicationDecisionConditionCardDto[]>([]);

  private url = `${environment.apiUrl}/v2/application-decision-condition-card`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async get(uuid: string): Promise<ApplicationDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionConditionCardDto>(`${this.url}/${uuid}`));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Application Decision Condition Card');
    }
    return;
  }

  async create(
    dto: CreateApplicationDecisionConditionCardDto,
  ): Promise<ApplicationDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.post<ApplicationDecisionConditionCardDto>(this.url, dto));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Application Decision Condition Card');
    }
    return;
  }

  async update(
    uuid: string,
    dto: UpdateApplicationDecisionConditionCardDto,
  ): Promise<ApplicationDecisionConditionCardDto | undefined> {
    try {
      return await firstValueFrom(this.http.patch<ApplicationDecisionConditionCardDto>(`${this.url}/${uuid}`, dto));
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Application Decision Condition Card');
    }
    return;
  }

  async getByCard(uuid: string): Promise<ApplicationDecisionConditionCardBoardDto | undefined> {
    try {
      return await firstValueFrom(
        this.http.get<ApplicationDecisionConditionCardBoardDto>(`${this.url}/board-card/${uuid}`),
      );
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch Application Decision Condition Card by Card');
    }
    return;
  }

  async fetchByApplicationFileNumber(fileNumber: string): Promise<void> {
    try {
      this.clearConditionCards();
      const conditionCards = await firstValueFrom(
        this.http.get<ApplicationDecisionConditionCardDto[]>(`${this.url}/application/${fileNumber}`),
      );
      this.$conditionCards.next(conditionCards);
    } catch (e: any) {
      console.error(e);
      this.toastService.showErrorToast(
        'Failed to fetch Application Decision Condition Cards by Application File Number',
      );
    }
    return;
  }

  clearConditionCards(): void {
    this.$conditionCards.next([]);
  }
}
