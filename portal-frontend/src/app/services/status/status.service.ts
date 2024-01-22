import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationStatusDto } from '../application-submission/application-submission.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = `${environment.authUrl}/public/status`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async getStatuses() {
    try {
      return await firstValueFrom(this.http.get<ApplicationStatusDto[]>(`${this.baseUrl}`));
    } catch (e: any) {
      if (e.status && e.status !== 503) {
        console.error(e);
        this.toastService.showErrorToast(`Failed to load Statuses. Please refresh the page and try again`);
      }
      return undefined;
    }
  }
}
