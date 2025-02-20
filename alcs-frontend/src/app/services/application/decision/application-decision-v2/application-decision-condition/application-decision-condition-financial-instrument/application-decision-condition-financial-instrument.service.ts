import { Injectable } from '@angular/core';
import {
  ApplicationDecisionConditionFinancialInstrumentDto,
  CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
} from './application-decision-condition-financial-instrument.dto';
import { DecisionConditionFinancialInstrumentService } from '../../../../../common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';
import { environment } from '../../../../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionConditionFinancialInstrumentService extends DecisionConditionFinancialInstrumentService {
  private baseUrl = `${environment.apiUrl}/v2/application-decision-condition`;
  private financialInstrumentUrl = 'financial-instruments';

  constructor(http: HttpClient) {
    super(http);
  }
  async getAll(conditionUuid: string): Promise<ApplicationDecisionConditionFinancialInstrumentDto[]> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}`;

    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionConditionFinancialInstrumentDto[]>(url));
    } catch (e) {
      this.handleError(e);
    }
  }

  get(conditionUuid: string, uuid: string): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    try {
      return firstValueFrom(this.http.get<ApplicationDecisionConditionFinancialInstrumentDto>(url));
    } catch (e) {
      this.handleError(e);
    }
  }

  create(
    conditionUuid: string,
    dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}`;

    try {
      return firstValueFrom(this.http.post<ApplicationDecisionConditionFinancialInstrumentDto>(url, dto));
    } catch (e) {
      this.handleError(e);
    }
  }

  update(
    conditionUuid: string,
    uuid: string,
    dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrumentDto> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    try {
      return firstValueFrom(this.http.patch<ApplicationDecisionConditionFinancialInstrumentDto>(url, dto));
    } catch (e) {
      this.handleError(e);
    }
  }

  delete(conditionUuid: string, uuid: string): Promise<void> {
    const url = `${this.baseUrl}/${conditionUuid}/${this.financialInstrumentUrl}/${uuid}`;

    try {
      return firstValueFrom(this.http.delete<void>(url));
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
