import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ToastService } from '../toast/toast.service';

export enum CONFIG_VALUE {
  PORTAL_MAINTENANCE_MODE = 'portal_maintenance_mode',
  APP_MAINTENANCE_BANNER = 'app_maintenance_banner',
  APP_MAINTENANCE_BANNER_MESSAGE = 'app_maintenance_banner_message',
}

@Injectable({
  providedIn: 'root',
})
export class AdminConfigurationService {
  private url = `${environment.apiUrl}/configuration`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async listConfigurations() {
    try {
      return await firstValueFrom(this.http.get<Array<{ name: CONFIG_VALUE; value: string }>>(`${this.url}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch the system configuration');
      console.log(e);
    }
    return;
  }

  async setConfiguration(name: CONFIG_VALUE, value: string) {
    try {
      return await firstValueFrom(
        this.http.post<void>(`${this.url}/${name}`, {
          value,
        }),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update configuration');
      console.log(e);
    }
    return;
  }
}
