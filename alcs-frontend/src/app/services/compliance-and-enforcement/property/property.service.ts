import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ComplianceAndEnforcementPropertyDto, UpdateComplianceAndEnforcementPropertyDto } from './property.dto';

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementPropertyService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/property`;

  constructor(private readonly http: HttpClient) {}

  async fetchParcels(fileNumber: string): Promise<ComplianceAndEnforcementPropertyDto[]> {
    return await firstValueFrom(this.http.get<ComplianceAndEnforcementPropertyDto[]>(`${this.url}/${fileNumber}`));
  }

  async fetchByFileUuid(fileUuid: string): Promise<ComplianceAndEnforcementPropertyDto[]> {
    return await firstValueFrom(this.http.get<ComplianceAndEnforcementPropertyDto[]>(`${this.url}/${fileUuid}`));
  }

  create(createDto: UpdateComplianceAndEnforcementPropertyDto): Observable<ComplianceAndEnforcementPropertyDto> {
    return this.http.post<ComplianceAndEnforcementPropertyDto>(this.url, createDto);
  }

  update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementPropertyDto,
  ): Observable<ComplianceAndEnforcementPropertyDto> {
    return this.http.patch<ComplianceAndEnforcementPropertyDto>(`${this.url}/${uuid}`, updateDto);
  }

  async delete(uuid: string): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.url}/${uuid}`));
  }
}
