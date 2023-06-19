import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { SearchResultDto } from './search.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(searchTerm: string) {
    try {
      return await firstValueFrom(this.http.get<SearchResultDto[]>(`${this.baseUrl}/${searchTerm}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search filed for ${searchTerm}`);
      return undefined;
    }
  }
}
