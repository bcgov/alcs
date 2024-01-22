import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  AdvancedSearchEntityResponseDto,
  AdvancedSearchResponseDto,
  ApplicationSearchResultDto,
  NonApplicationSearchResultDto,
  NonApplicationsSearchRequestDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
  SearchResultDto,
} from './search.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async advancedSearchFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(this.http.post<AdvancedSearchResponseDto>(`${this.baseUrl}/advanced`, searchDto));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async fetch(searchTerm: string) {
    try {
      return await firstValueFrom(this.http.get<SearchResultDto[]>(`${this.baseUrl}/${searchTerm}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed for ${searchTerm}`);
      return undefined;
    }
  }

  async advancedSearchApplicationsFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<ApplicationSearchResultDto>>(
          `${this.baseUrl}/advanced/application`,
          searchDto
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchNoticeOfIntentsFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NoticeOfIntentSearchResultDto>>(
          `${this.baseUrl}/advanced/notice-of-intent`,
          searchDto
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchNonApplicationsFetch(searchDto: NonApplicationsSearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NonApplicationSearchResultDto>>(
          `${this.baseUrl}/advanced/non-applications`,
          searchDto
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchNotificationsFetch(searchDto: NonApplicationsSearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NotificationSearchResultDto>>(
          `${this.baseUrl}/advanced/notifications`,
          searchDto
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }
}
