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

  async getByPidPin(pidPin: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ParcelLookupDto>(`${this.serviceUrl}/search/${pidPin}`));
    } catch (e) {
      this.toastService.showErrorToast('No Parcel found with the given PID/PIN, please verify and try again');
      return undefined;
    }
  }
}
