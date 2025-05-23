import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../../shared/utils/file';
import { verifyFileSize } from '../../../../shared/utils/file-size-checker';
import { ToastService } from '../../../toast/toast.service';
import {
  ApplicationDecisionCodesDto,
  ApplicationDecisionDto,
  ApplicationDecisionWithLinkedResolutionDto,
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision-v2.dto';
import { ApplicationDecisionStatus } from './application-condition-status.dto';

export enum IncludeQueryParam {
  CONDITION_STATUS = 'conditionStatus',
}
@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionV2Service {
  private url = `${environment.apiUrl}/v2/application-decision`;
  private decision: ApplicationDecisionDto | undefined;
  private decisions: ApplicationDecisionWithLinkedResolutionDto[] = [];
  $decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);
  $decisions = new BehaviorSubject<ApplicationDecisionWithLinkedResolutionDto[]>([]);

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchByApplication(fileNumber: string) {
    let decisions: ApplicationDecisionDto[] = [];
    try {
      decisions = await firstValueFrom(
        this.http.get<ApplicationDecisionDto[]>(`${this.url}/application/${fileNumber}`),
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return decisions;
  }

  async getStatus(conditionUuid: string): Promise<ApplicationDecisionStatus> {
    try {
      return await firstValueFrom(
        this.http.get<ApplicationDecisionStatus>(`${this.url}/condition/${conditionUuid}/status`),
      );
    } catch (e: any) {
      this.toastService.showErrorToast(e.error?.message ?? 'No status found');
      throw e;
    }
  }

  async fetchCodes(): Promise<ApplicationDecisionCodesDto> {
    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionCodesDto>(`${this.url}/codes`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decisions');
    }
    return {
      outcomes: [],
      decisionMakers: [],
      ceoCriterion: [],
      decisionComponentTypes: [],
      decisionConditionTypes: [],
      naruSubtypes: [],
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
      this.toastService.showErrorToast('Failed to delete decision');
    }
  }

  async uploadFile(decisionUuid: string, file: File) {
    const isValidSize = verifyFileSize(file, this.toastService);
    if (!isValidSize) {
      return;
    }

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/${decisionUuid}/file`, formData));
    this.toastService.showSuccessToast('Document uploaded');
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

  async updateFile(decisionUuid: string, documentUuid: string, fileName: string) {
    try {
      await firstValueFrom(
        this.http.patch(`${this.url}/${decisionUuid}/file/${documentUuid}`, {
          fileName,
        }),
      );
      this.toastService.showSuccessToast('File updated');
    } catch (err) {
      this.toastService.showErrorToast('Failed to update file');
    }
  }

  async deleteFile(decisionUuid: string, documentUuid: string) {
    const url = `${this.url}/${decisionUuid}/file/${documentUuid}`;
    return await firstValueFrom(this.http.delete<{ url: string }>(url));
  }

  async getByUuid(uuid: string, includeConditionStatus: boolean = false) {
    let decision: ApplicationDecisionDto | undefined;
    const url = `${this.url}/${uuid}${includeConditionStatus ? `?include=${IncludeQueryParam.CONDITION_STATUS}` : ''}`;
    try {
      decision = await firstValueFrom(this.http.get<ApplicationDecisionDto>(url));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch decision');
    }
    return decision;
  }

  async loadDecision(uuid: string) {
    this.clearDecision();
    this.decision = await this.getByUuid(uuid);
    this.$decision.next(this.decision);
  }

  async loadDecisions(fileNumber: string) {
    this.clearDecisions();
    const decisions = await this.fetchByApplication(fileNumber);
    const decisionsLength = decisions.length;

    this.decisions = decisions.map((decision, ind) => ({
      ...decision,
      reconsideredByResolutions: decision.reconsideredBy?.flatMap((r) => r.linkedResolutions) || [],
      modifiedByResolutions: decision.modifiedBy?.flatMap((r) => r.linkedResolutions) || [],
      index: decisionsLength - ind,
    }));

    this.$decisions.next(this.decisions);
  }

  clearDecision() {
    this.$decision.next(undefined);
  }

  clearDecisions() {
    this.$decisions.next([]);
  }

  async getNextAvailableResolutionNumber(resolutionYear: number) {
    let result: number | undefined = undefined;
    try {
      result = await firstValueFrom(this.http.get<number>(`${this.url}/next-resolution-number/${resolutionYear}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch resolutionNumber');
    }
    return result;
  }

  async resolutionNumberExists(resolutionYear: number, resolutionNumber: number) {
    let result: boolean | undefined = undefined;
    try {
      result = await firstValueFrom(
        this.http.get<boolean>(`${this.url}/resolution-number-exists/${resolutionYear}/${resolutionNumber}`),
      );
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch resolutionNumber');
    }
    return result;
  }
}
