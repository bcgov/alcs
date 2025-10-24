import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ComplianceAndEnforcementSubmitterDto, UpdateComplianceAndEnforcementSubmitterDto } from './submitter.dto';

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementSubmitterService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/submitter`;

  constructor(private readonly http: HttpClient) {}

  create(updateDto: UpdateComplianceAndEnforcementSubmitterDto): Observable<ComplianceAndEnforcementSubmitterDto> {
    return this.http.post<ComplianceAndEnforcementSubmitterDto>(this.url, updateDto);
  }

  update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementSubmitterDto,
  ): Observable<ComplianceAndEnforcementSubmitterDto> {
    return this.http.patch<ComplianceAndEnforcementSubmitterDto>(`${this.url}/${uuid}`, updateDto);
  }

  bulkUpdate(
    submitters: { uuid: string; dto: UpdateComplianceAndEnforcementSubmitterDto }[],
  ): Observable<ComplianceAndEnforcementSubmitterDto[]> {
    return this.http.patch<ComplianceAndEnforcementSubmitterDto[]>(`${this.url}/bulk`, { submitters });
  }

  delete(uuid: string) {
    return firstValueFrom(this.http.delete<ComplianceAndEnforcementSubmitterDto>(`${this.url}/${uuid}`));
  }
}
