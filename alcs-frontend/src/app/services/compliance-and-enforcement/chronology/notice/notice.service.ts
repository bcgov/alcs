import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NoticeDto, UpdateNoticeDto } from './notice.dto';

export interface NoticeOptions {
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
export class ComplianceAndEnforcementNoticeService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/chronology/notice`;

  noticesByUuid = signal<Map<string, NoticeDto>>(new Map());

  constructor(private readonly http: HttpClient) {}

  loadNotices(options: NoticeOptions = {}): Observable<NoticeDto[]> {
    let params = new HttpParams();

    for (const [option, value] of Object.entries(options)) {
      if (options[option as keyof NoticeOptions]) {
        params = params.set(option, value);
      }
    }

    return this.http.get<NoticeDto[]>(`${this.url}`, { params }).pipe(
      tap((freshNotices) => {
        this.noticesByUuid.update((staleNoticesByUuid) => {
          const freshNoticesByUuid = new Map<string, NoticeDto>(staleNoticesByUuid);
          for (const notice of freshNotices) {
            freshNoticesByUuid.set(notice.uuid, notice);
          }
          return freshNoticesByUuid;
        });
      }),
    );
  }

  async createDraft(entryUuid: string): Promise<string> {
    const { uuid } = await firstValueFrom(this.http.post<{ uuid: string }>(`${this.url}/draft`, { entryUuid }));

    return uuid;
  }

  update(uuid: string, updateDto: UpdateNoticeDto): Observable<NoticeDto> {
    return this.http.patch<NoticeDto>(`${this.url}/${uuid}`, updateDto);
  }

  delete(uuid: string): Observable<string> {
    return this.http.delete<{ uuid: string }>(`${this.url}/${uuid}`).pipe(
      map((result) => result.uuid),
      tap((receivedUuid) => {
        this.noticesByUuid.update((staleNoticesByUuid) => {
          const freshNoticesByUuid = new Map<string, NoticeDto>(staleNoticesByUuid);
          freshNoticesByUuid.delete(receivedUuid);
          return freshNoticesByUuid;
        });
      }),
    );
  }
}
