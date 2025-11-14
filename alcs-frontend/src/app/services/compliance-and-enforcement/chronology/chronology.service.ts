import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementChronologyService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/chronology`;

  constructor(private readonly http: HttpClient) {}

  entriesByFileId(
    fileId: string,
    options: { idType: string } = { idType: 'uuid' },
  ): Observable<ComplianceAndEnforcementChronologyEntryDto[]> {
    const params = new HttpParams().set('fileId', fileId).set('idType', options.idType);

    return this.http.get<ComplianceAndEnforcementChronologyEntryDto[]>(`${this.url}/entry`, { params });
  }

  createEntry(
    createDto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Observable<ComplianceAndEnforcementChronologyEntryDto> {
    return this.http.post<ComplianceAndEnforcementChronologyEntryDto>(`${this.url}/entry`, createDto);
  }

  updateEntry(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Observable<ComplianceAndEnforcementChronologyEntryDto> {
    return this.http.patch<ComplianceAndEnforcementChronologyEntryDto>(`${this.url}/entry/${uuid}`, updateDto);
  }

  async deleteEntry(uuid: string): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    return await firstValueFrom(
      this.http.delete<ComplianceAndEnforcementChronologyEntryDto>(`${this.url}/entry/${uuid}`),
    );
  }
}
