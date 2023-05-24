import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { PortalDecisionDto } from './application-decision.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDecisionService {
  private serviceUrl = `${environment.apiUrl}/application-decision`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getByFileId(fileNumber: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<PortalDecisionDto[]>(`${this.serviceUrl}/application/${fileNumber}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load decisions, please try again');
    }
    return undefined;
  }

  async openFile(documentUuid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<{ url: string }>(`${this.serviceUrl}/${documentUuid}/open`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to open the document, please try again');
    }
    return undefined;
  }
}
