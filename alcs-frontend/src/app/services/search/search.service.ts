import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { AdvancedSearchResultDto, SearchRequestDto, SearchResultDto } from './search.dto';


@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async advancedSearchFetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(this.http.post<AdvancedSearchResultDto>(`${this.baseUrl}/advanced`, searchDto));
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
}
