import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private baseUrl = `${environment.apiUrl}/inbox`;
  private showBanner = new BehaviorSubject<boolean>(false);

  $showBanner = this.showBanner.asObservable();

  constructor(private http: HttpClient) {}

  async check() {
    try {
      return await firstValueFrom(this.http.get<string>(`${this.baseUrl}`));
    } catch (e) {
      return undefined;
    }
  }

  // TODO: Add test
  setShowBanner(showBanner: boolean) {
    this.showBanner.next(showBanner);
  }
}
