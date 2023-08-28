import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { SearchRequestDto, SearchResultDto } from './search.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(searchDto: SearchRequestDto) {
    try {
      return await firstValueFrom(this.http.post<SearchResultDto[]>(`${this.baseUrl}`, searchDto));
    } catch (e) {
      console.error(e);
      console.warn(`search params ${searchDto}`);
      this.toastService.showErrorToast(`Search failed. Please refresh the page and try again`);
      return undefined;
    }
  }
}
