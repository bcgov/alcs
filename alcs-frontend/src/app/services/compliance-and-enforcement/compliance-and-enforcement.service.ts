import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import moment from 'moment';

export enum Status {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

interface FetchOptions {
  withSubmitters?: boolean;
  withProperty?: boolean;
}

export const statusFromFile = ({ dateOpened, dateClosed }: ComplianceAndEnforcementDto): Status | null =>
  dateOpened && !dateClosed ? Status.OPEN : dateClosed ? Status.CLOSED : null;

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement`;

  $file: BehaviorSubject<ComplianceAndEnforcementDto | null> = new BehaviorSubject<ComplianceAndEnforcementDto | null>(
    null,
  );

  constructor(private readonly http: HttpClient) {}

  async loadFile(fileNumber: string, options?: FetchOptions) {
    const file = await this.fetchByFileNumber(fileNumber, options);
    this.$file.next(file);
  }

  async fetchAll() {
    await firstValueFrom(this.http.get<ComplianceAndEnforcementDto[]>(this.url));
  }

  async fetchByFileNumber(fileNumber: string, options?: FetchOptions): Promise<ComplianceAndEnforcementDto> {
    let params = new HttpParams();
    params = params.set('withSubmitters', !!options?.withSubmitters?.toString());
    params = params.set('withProperty', !!options?.withProperty?.toString());

    return await firstValueFrom(this.http.get<ComplianceAndEnforcementDto>(`${this.url}/${fileNumber}`, { params }));
  }

  async create(
    updateDto: UpdateComplianceAndEnforcementDto,
    createInitialSubmitter = false,
    createInitialProperty = false,
  ): Promise<ComplianceAndEnforcementDto> {
    let params = new HttpParams()
      .set('createInitialSubmitter', createInitialSubmitter.toString())
      .set('createInitialProperty', createInitialProperty.toString());

    return await firstValueFrom(this.http.post<ComplianceAndEnforcementDto>(this.url, updateDto, { params }));
  }

  update(
    id: string,
    updateDto: UpdateComplianceAndEnforcementDto,
    options: { idType: string } = { idType: 'uuid' },
  ): Observable<ComplianceAndEnforcementDto> {
    return this.http.patch<ComplianceAndEnforcementDto>(`${this.url}/${id}?idType=${options.idType}`, updateDto);
  }

  async setStatus(fileNumber: string, status: Status) {
    const dto: UpdateComplianceAndEnforcementDto = {
      dateClosed: status === Status.CLOSED ? moment.now() : null,
    };

    await firstValueFrom(this.update(fileNumber, dto, { idType: 'fileNumber' }));
  }

  async delete(uuid: string): Promise<UpdateComplianceAndEnforcementDto> {
    return await firstValueFrom(this.http.delete<UpdateComplianceAndEnforcementDto>(`${this.url}/${uuid}`));
  }
}
