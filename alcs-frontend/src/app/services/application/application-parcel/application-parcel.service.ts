import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationParcelDto } from '../application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationParcelService {
  private baseUrl = `${environment.apiUrl}/application-parcel`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchParcels(fileNumber: string): Promise<ApplicationParcelDto[]> {
    try {
      return firstValueFrom(this.http.get<ApplicationParcelDto[]>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Parcels');
      throw e;
    }
  }
}
