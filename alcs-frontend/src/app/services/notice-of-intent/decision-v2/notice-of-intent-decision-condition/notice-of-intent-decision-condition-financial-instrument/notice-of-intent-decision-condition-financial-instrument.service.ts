import { Injectable } from '@angular/core';
import {
  NoticeOfIntentDecisionConditionFinancialInstrumentDto,
  CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
} from './notice-of-intent-decision-condition-financial-instrument.dto';
import { DecisionConditionFinancialInstrumentService } from '../../../../common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InstrumentStatus } from '../../../../common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentDecisionConditionFinancialInstrumentService extends DecisionConditionFinancialInstrumentService {
  private baseUrl = `${environment.apiUrl}/notice-of-intent-decision-condition`;
  private financialInstrumentUrl = 'financial-instruments';

  constructor(http: HttpClient) {
    super(http);
  }
  async getAll(conditionUuid: string): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto[]> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}`;

    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDecisionConditionFinancialInstrumentDto[]>(url));
    } catch (e) {
      this.handleError(e);
    }
  }

  async get(conditionUuid: string, uuid: string): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentDecisionConditionFinancialInstrumentDto>(url));
    } catch (e) {
      this.handleError(e);
    }
  }

  async create(
    conditionUuid: string,
    dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}`;

    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentDecisionConditionFinancialInstrumentDto>(url, dto));
    } catch (e) {
      this.handleError(e);
    }
  }

  async update(
    conditionUuid: string,
    uuid: string,
    dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto,
  ): Promise<NoticeOfIntentDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    if (dto.status === InstrumentStatus.RECEIVED) {
      if (dto.statusDate) {
        delete dto.statusDate;
      }
      if (dto.explanation) {
        delete dto.explanation;
      }
    }

    try {
      return await firstValueFrom(this.http.patch<NoticeOfIntentDecisionConditionFinancialInstrumentDto>(url, dto));
    } catch (e) {
      this.handleError(e);
    }
  }

  async delete(conditionUuid: string, uuid: string): Promise<void> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    try {
      return await firstValueFrom(this.http.delete<void>(url));
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: any): never {
    console.error(e);
    let message;
    if (e instanceof HttpErrorResponse) {
      if (e.status === 404) {
        message = 'Condition/financial instrument not found';
      } else if (e.status === 400) {
        message = 'Condition is not of type Financial Security';
      } else {
        if (e.error.message === 'Condition type Financial Security not found') {
          message = 'Condition type Financial Security not found';
        } else {
          message = 'Failed to retrieve the financial instruments';
        }
      }
    } else {
      message = 'Failed to perform the operation';
    }
    throw new Error(message);
  }
}
