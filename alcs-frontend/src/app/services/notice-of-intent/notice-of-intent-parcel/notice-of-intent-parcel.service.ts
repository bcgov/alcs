import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { NoticeOfIntentParcelDto } from '../notice-of-intent.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentParcelService {
  private baseUrl = `${environment.apiUrl}/notice-of-intent-parcel`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchParcels(fileNumber: string): Promise<NoticeOfIntentParcelDto[]> {
    try {
      return firstValueFrom(this.http.get<NoticeOfIntentParcelDto[]>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Parcels');
      throw e;
    }
  }

  async setParcelArea(uuid: string, alrArea: number | null): Promise<NoticeOfIntentParcelDto[]> {
    try {
      const res = await firstValueFrom(
        this.http.post<NoticeOfIntentParcelDto[]>(`${this.baseUrl}/${uuid}`, {
          alrArea,
        })
      );
      this.toastService.showSuccessToast('Notice of Intent updated');

      return res;
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Notice of Intent Parcel');
      throw e;
    }
  }
}
