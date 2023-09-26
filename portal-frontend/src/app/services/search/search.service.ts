import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  AdvancedSearchEntityResponseDto,
  SearchResponseDto,
  BaseSearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
} from './search.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.authUrl}/public/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async search(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(this.http.post<SearchResponseDto>(`${this.baseUrl}`, searchDto));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchApplications(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<BaseSearchResultDto>>(`${this.baseUrl}/application`, searchDto)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchNoticeOfIntents(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NoticeOfIntentSearchResultDto>>(
          `${this.baseUrl}/notice-of-intent`,
          searchDto
        )
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }

  async searchNotifications(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(
        this.http.post<AdvancedSearchEntityResponseDto<NotificationSearchResultDto>>(
          `${this.baseUrl}/notifications`,
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
