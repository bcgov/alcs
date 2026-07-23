import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';

export interface EntryOptions {
  filterByUuid?: string;
  filterByFileUuid?: string;
  filterByFileNumber?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementChronologyService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/chronology`;

  entriesByUuid = signal<Map<string, ComplianceAndEnforcementChronologyEntryDto>>(new Map());

  constructor(private readonly http: HttpClient) {}

  loadEntries(options: EntryOptions = {}): Observable<ComplianceAndEnforcementChronologyEntryDto[]> {
    let params = new HttpParams();

    for (const [option, value] of Object.entries(options)) {
      if (options[option as keyof EntryOptions]) {
        params = params.set(option, value);
      }
    }

    return this.http.get<ComplianceAndEnforcementChronologyEntryDto[]>(`${this.url}/entry`, { params }).pipe(
      tap((freshEntries) => {
        this.entriesByUuid.update((staleEntriesByUuid) => {
          const freshEntriesByUuid = new Map<string, ComplianceAndEnforcementChronologyEntryDto>(staleEntriesByUuid);
          for (const entry of freshEntries) {
            freshEntriesByUuid.set(entry.uuid, entry);
          }
          return freshEntriesByUuid;
        });
      }),
    );
  }

  clear() {
    this.entriesByUuid.set(new Map<string, ComplianceAndEnforcementChronologyEntryDto>());
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

  deleteEntry(uuid: string): Observable<string> {
    return this.http.delete<{ uuid: string }>(`${this.url}/entry/${uuid}`).pipe(
      map((result) => result.uuid),
      tap((uuid) => {
        this.entriesByUuid.update((staleEntriesByUuid) => {
          const freshEntriesByUuid = new Map<string, ComplianceAndEnforcementChronologyEntryDto>(staleEntriesByUuid);
          freshEntriesByUuid.delete(uuid);
          return freshEntriesByUuid;
        });
      }),
    );
  }
}
