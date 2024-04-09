import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private baseUrl = environment.apiUrl;

  $showBanner = new BehaviorSubject<boolean>(false);
  $bannerMessage = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  async getBanner() {
    try {
      return await firstValueFrom(
        this.http.get<{ showBanner: boolean; message: string }>(`${this.baseUrl}/maintenance/banner`),
      );
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  setShowBanner(showBanner: boolean) {
    this.$showBanner.next(showBanner);
  }

  setBannerMessage(message: string) {
    this.$bannerMessage.next(message);
  }
}
