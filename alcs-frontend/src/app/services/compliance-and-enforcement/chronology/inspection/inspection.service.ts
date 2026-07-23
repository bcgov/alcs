import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { downloadDocxFile } from '../../../../shared/utils/file';
import { InspectionDto, UpdateInspectionDto } from './inspection.dto';

export interface InspectionOptions {
  filterByUuid?: string;
  filterByEntryUuid?: string;
}

export interface DeleteResult {
  raw: any;
  affected?: number | null | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementChronologyInspectionService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/chronology/inspection`;

  inspectionsByUuid = signal<Map<string, InspectionDto>>(new Map());

  constructor(private readonly http: HttpClient) {}

  loadInspections(options: InspectionOptions = {}): Observable<InspectionDto[]> {
    let params = new HttpParams();

    for (const [option, value] of Object.entries(options)) {
      if (options[option as keyof InspectionOptions]) {
        params = params.set(option, value);
      }
    }

    return this.http.get<InspectionDto[]>(`${this.url}`, { params }).pipe(
      tap((freshInspections) => {
        this.inspectionsByUuid.update((staleInspectionsByUuid) => {
          const freshInspectionsByUuid = new Map<string, InspectionDto>(staleInspectionsByUuid);
          for (const inspection of freshInspections) {
            freshInspectionsByUuid.set(inspection.uuid, inspection);
          }
          return freshInspectionsByUuid;
        });
      }),
    );
  }

  async createDraft(officerUuid: string, entryUuid: string): Promise<string> {
    const { uuid } = await firstValueFrom(
      this.http.post<{ uuid: string }>(`${this.url}/draft`, { officerUuid, entryUuid }),
    );

    return uuid;
  }

  update(uuid: string, updateDto: UpdateInspectionDto): Observable<InspectionDto> {
    return this.http.patch<InspectionDto>(`${this.url}/${uuid}`, updateDto);
  }

  delete(uuid: string): Observable<string> {
    return this.http.delete<{ uuid: string }>(`${this.url}/${uuid}`).pipe(
      map((result) => result.uuid),
      tap((receivedUuid) => {
        this.inspectionsByUuid.update((staleInspectionsByUuid) => {
          const freshInspectionsByUuid = new Map<string, InspectionDto>(staleInspectionsByUuid);
          freshInspectionsByUuid.delete(receivedUuid);
          return freshInspectionsByUuid;
        });
      }),
    );
  }

  async generateReportTemplate(uuid: string) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    const data = await firstValueFrom(this.http.get(`${this.url}/report-template-data/${uuid}`, httpOptions));

    await downloadDocxFile('inspection-report-template', data);
  }
}
