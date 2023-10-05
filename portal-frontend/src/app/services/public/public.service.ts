import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { GetPublicApplicationResponseDto } from './public.dto';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private serviceUrl = `${environment.authUrl}/public`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getApplication(fileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<GetPublicApplicationResponseDto>(`${this.serviceUrl}/application/${fileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application, please try again later');
      return undefined;
    }
  }

  async getApplicationFileUrl(fileId: string, uuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${this.serviceUrl}/application/${fileId}/${uuid}/open`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application File, please try again later');
      return undefined;
    }
  }
}
