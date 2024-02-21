import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private baseUrl = `${environment.apiUrl}/inbox`;

  constructor(private http: HttpClient) {}

  async check() {
    try {
      return await firstValueFrom(this.http.get<string>(`${this.baseUrl}`));
    } catch (e) {
      return undefined;
    }
  }
}
