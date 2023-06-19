import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch(searchTerm: string) {
    try {
      return await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${searchTerm}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast(`Search filed for ${searchTerm}`);
    }
  }
}
