import { HttpClient, HttpParams } from '@angular/common/http';
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

  async fetchByFileNumber(fileNumber: string, withSubmitters = false): Promise<ComplianceAndEnforcementDto> {
    let params = new HttpParams();
    params = params.set('withSubmitters', withSubmitters.toString());
    
    return await firstValueFrom(
      this.http.get<ComplianceAndEnforcementDto>(`${this.url}/${fileNumber}`, { params }),
    );
  }

  async create(
    updateDto: UpdateComplianceAndEnforcementDto,
    createInitialSubmitter = false,
    createInitialProperty = false,
  ): Promise<ComplianceAndEnforcementDto> {
    let params = new HttpParams()
      .set('createInitialSubmitter', createInitialSubmitter.toString())
      .set('createInitialProperty', createInitialProperty.toString());
    
    return await firstValueFrom(
      this.http.post<ComplianceAndEnforcementDto>(this.url, updateDto, { params }),
    );
  }

  update(uuid: string, updateDto: UpdateComplianceAndEnforcementDto): Observable<ComplianceAndEnforcementDto> {
    return this.http.patch<ComplianceAndEnforcementDto>(`${this.url}/${uuid}`, updateDto);
  }

  async delete(uuid: string): Promise<UpdateComplianceAndEnforcementDto> {
    return await firstValueFrom(this.http.delete<UpdateComplianceAndEnforcementDto>(`${this.url}/${uuid}`));
  }
}
