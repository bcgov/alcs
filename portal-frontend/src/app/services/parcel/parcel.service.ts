import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ParcelLookupDto } from './parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class ParcelService {
  private serviceUrl = `${environment.apiUrl}/parcel`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async getByPid(pid: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ParcelLookupDto>(`${this.serviceUrl}/search/pid/${pid}`));
    } catch (e) {
      this.toastService.showErrorToast('No Parcel found with the given PID, please verify and try again');
      return undefined;
    }
  }

  async getByPin(pin: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ParcelLookupDto>(`${this.serviceUrl}/search/pin/${pin}`));
    } catch (e) {
      this.toastService.showErrorToast('No Parcel found with the given PIN, please verify and try again');
      return undefined;
    }
  }
}
