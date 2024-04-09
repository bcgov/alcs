import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async check() {
    try {
      return await firstValueFrom(this.http.get<string>(`${this.baseUrl}/inbox`));
    } catch (e) {
      return undefined;
    }
  }

  async getBanner() {
    try {
      return await firstValueFrom(
        this.http.get<{ showBanner: boolean; message: string }>(`${this.baseUrl}/maintenance/banner`)
      );
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
