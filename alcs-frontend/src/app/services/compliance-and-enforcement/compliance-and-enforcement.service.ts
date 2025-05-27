import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement`;

  constructor(private readonly http: HttpClient) {}

  async fetchAll() {
    await firstValueFrom(this.http.get<ComplianceAndEnforcementDto[]>(this.url));
  }

  async fetchByFileNumber(fileNumber: string) {
    return await firstValueFrom(this.http.get<ComplianceAndEnforcementDto>(`${this.url}/${fileNumber}`));
  }

  async create(updateDto: UpdateComplianceAndEnforcementDto) {
    return await firstValueFrom(this.http.post<UpdateComplianceAndEnforcementDto>(this.url, updateDto));
  }

  update(uuid: string, updateDto: UpdateComplianceAndEnforcementDto): Observable<ComplianceAndEnforcementDto> {
    return this.http.patch<ComplianceAndEnforcementDto>(`${this.url}/${uuid}`, updateDto);
  }

  async delete(uuid: string): Promise<UpdateComplianceAndEnforcementDto> {
    return await firstValueFrom(this.http.delete<UpdateComplianceAndEnforcementDto>(`${this.url}/${uuid}`));
  }
}
