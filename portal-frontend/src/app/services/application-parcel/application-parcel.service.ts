import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ApplicationParcelDto, ApplicationParcelUpdateDto } from './application-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationParcelService {
  private serviceUrl = `${environment.apiUrl}/application-parcel`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}

  async fetchByFileId(applicationFileId: string) {
    try {
      return firstValueFrom(
        this.httpClient.get<ApplicationParcelDto[]>(`${this.serviceUrl}/application/${applicationFileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Application Review, please try again later');
    }
    return undefined;
  }

  async create(applicationFileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<ApplicationParcelDto>(`${this.serviceUrl}`, { applicationFileId })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: ApplicationParcelUpdateDto) {
    try {
      return await firstValueFrom(
        this.httpClient.put<ApplicationParcelDto>(`${this.serviceUrl}/${uuid}`, {
          ...updateDto,
          mapAreaHectares: updateDto.mapAreaHectares
            ? parseFloat(updateDto.mapAreaHectares)
            : updateDto.mapAreaHectares,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Parcel, please try again later');
      return undefined;
    }
  }
}
