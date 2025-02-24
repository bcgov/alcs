import { HttpClient } from '@angular/common/http';
import {
  CreateUpdateDecisionConditionFinancialInstrumentDto,
  DecisionConditionFinancialInstrumentDto,
} from './decision-condition-financial-instrument.dto';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class DecisionConditionFinancialInstrumentService {
  constructor(protected http: HttpClient) {}

  abstract getAll(conditionUuid: string): Promise<DecisionConditionFinancialInstrumentDto[]>;

  abstract get(conditionUuid: string, uuid: string): Promise<DecisionConditionFinancialInstrumentDto>;

  abstract create(
    conditionUuid: string,
    dto: CreateUpdateDecisionConditionFinancialInstrumentDto,
  ): Promise<DecisionConditionFinancialInstrumentDto>;

  abstract update(
    conditionUuid: string,
    uuid: string,
    dto: CreateUpdateDecisionConditionFinancialInstrumentDto,
  ): Promise<DecisionConditionFinancialInstrumentDto>;

  abstract delete(conditionUuid: string, uuid: string): Promise<void>;
}
