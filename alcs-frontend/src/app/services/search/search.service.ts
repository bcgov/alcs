import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  AdvancedSearchEntityResponseDto,
  AdvancedSearchResponseDto,
  ApplicationSearchResultDto,
  InquirySearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  PlanningReviewSearchResultDto,
  SearchRequestDto,
  SearchResultDto,
} from './search.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

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
          searchDto,
        ),
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
          searchDto,
        ),
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchPlanningReviewsFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<PlanningReviewSearchResultDto>>(
          `${this.baseUrl}/advanced/planning-reviews`,
          searchDto,
        ),
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchNotificationsFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NotificationSearchResultDto>>(
          `${this.baseUrl}/advanced/notifications`,
          searchDto,
        ),
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async advancedSearchInquiryFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<InquirySearchResultDto>>(
          `${this.baseUrl}/advanced/inquiries`,
          searchDto,
        ),
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }
}
