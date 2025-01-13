import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from '../../application-decision-v2.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionConditionCardService {
  private url = `${environment.apiUrl}/v2/application-decision-condition-card`;

  constructor(private http: HttpClient) {}

  async get(uuid: string): Promise<ApplicationDecisionConditionCardDto> {
    try {
      return await firstValueFrom(this.http.get<ApplicationDecisionConditionCardDto>(`${this.url}/${uuid}`));
    } catch (e: any) {
      throw e;
    }
  }

  async create(dto: CreateApplicationDecisionConditionCardDto): Promise<ApplicationDecisionConditionCardDto> {
    try {
      return await firstValueFrom(this.http.post<ApplicationDecisionConditionCardDto>(this.url, dto));
    } catch (e: any) {
      throw e;
    }
  }

  async update(
    uuid: string,
    dto: UpdateApplicationDecisionConditionCardDto,
  ): Promise<ApplicationDecisionConditionCardDto> {
    try {
      return await firstValueFrom(this.http.patch<ApplicationDecisionConditionCardDto>(`${this.url}/${uuid}`, dto));
    } catch (e: any) {
      throw e;
    }
  }
}
