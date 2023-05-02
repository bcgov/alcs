import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../../shared/utils/file';
import { ToastService } from '../../../toast/toast.service';
import {
  ApplicationDecisionDto,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
  UpdateApplicationDecisionDto,
} from './application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionV2Service {
  private url = `${environment.apiUrl}/v2/application-decision`;
  $decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
  $decisions = new BehaviorSubject<ApplicationDecisionDto[] | []>([]);

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(fileNumber: string) {
    let decisions: ApplicationDecisionDto[] = [];
    try {
      decisions = await firstValueFrom(
        this.http.get<ApplicationDecisionDto[]>(`${this.url}/application/${fileNumber}`)
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return decisions;
  }

  async fetchCodes() {
    let outcomes: DecisionOutcomeCodeDto[] = [];
    let decisionMakers: DecisionMakerDto[] = [];
    let ceoCriterion: CeoCriterionDto[] = [];
    try {
      const res = await firstValueFrom(
        this.http.get<{
          outcomes: DecisionOutcomeCodeDto[];
          decisionMakers: DecisionMakerDto[];
          ceoCriterion: CeoCriterionDto[];
        }>(`${this.url}/codes`)
      );
      outcomes = res.outcomes;
      decisionMakers = res.decisionMakers;
      ceoCriterion = res.ceoCriterion;
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return {
      outcomes,
      decisionMakers,
      ceoCriterion,
    };
  }

  async update(uuid: string, data: UpdateApplicationDecisionDto) {
    try {
      const res = await firstValueFrom(this.http.patch<ApplicationDecisionDto>(`${this.url}/${uuid}`, data));
      this.toastService.showSuccessToast('Decision updated');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to update decision');
      }
      throw e;
    }
  }

  async create(decision: CreateApplicationDecisionDto) {
    try {
      const res = await firstValueFrom(this.http.post<ApplicationDecisionDto>(`${this.url}`, decision));
      this.toastService.showSuccessToast('Decision created');
      return res;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast(`Failed to create decision`);
      }
      throw e;
    }
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationDecisionDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Decision deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete meeting');
    }
  }

  async uploadFile(decisionUuid: string, file: File) {
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return;
    }

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/${decisionUuid}/file`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
    return res;
  }

  async downloadFile(decisionUuid: string, documentUuid: string, fileName: string, isInline = true) {
    const url = `${this.url}/${decisionUuid}/file/${documentUuid}`;
    const finalUrl = isInline ? `${url}/open` : `${url}/download`;
    const data = await firstValueFrom(this.http.get<{ url: string }>(finalUrl));
    if (isInline) {
      openFileInline(data.url, fileName);
    } else {
      downloadFileFromUrl(data.url, fileName);
    }
  }

  async deleteFile(decisionUuid: string, documentUuid: string) {
    const url = `${this.url}/${decisionUuid}/file/${documentUuid}`;
    return await firstValueFrom(this.http.delete<{ url: string }>(url));
  }

  async getByUuid(uuid: string) {
    let decision: ApplicationDecisionDto | undefined;
    try {
      decision = await firstValueFrom(this.http.get<ApplicationDecisionDto>(`${this.url}/${uuid}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision');
    }
    return decision;
  }

  async loadDecision(uuid: string) {
    const decision = await this.getByUuid(uuid);
    this.$decision.next(decision);
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.fetchByApplication(fileNumber);
    this.$decisions.next(decisions);
  }

  async cleanDecision() {
    this.$decision.next(undefined);
  }

  async cleanDecisions() {
    this.$decisions.next([]);
  }

  async getNextAvailableResolutionYear(resolutionYear: number) {
    let result: number | undefined = undefined;
    try {
      result = await firstValueFrom(
        this.http.get<number | undefined>(`${this.url}/next-resolution-number/${resolutionYear}`)
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch resolutionNumber');
    }
    return result;
  }
}
