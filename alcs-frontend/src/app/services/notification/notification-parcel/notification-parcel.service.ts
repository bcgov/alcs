import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NotificationParcelDto } from './notification-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationParcelService {
  private baseUrl = `${environment.apiUrl}/notification-parcel`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchParcels(fileNumber: string): Promise<NotificationParcelDto[]> {
    try {
      return firstValueFrom(this.http.get<NotificationParcelDto[]>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Notification Parcels');
      throw e;
    }
  }
}
