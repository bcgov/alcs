import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationBoundaryAmendmentDto,
  CreateApplicationBoundaryAmendmentDto,
  UpdateApplicationBoundaryAmendmentDto,
} from './application-boundary-amendment.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationBoundaryAmendmentService {
  private url = `${environment.apiUrl}/v2/application-boundary-amendment`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async list(fileNumber: string) {
    try {
      return await firstValueFrom(
        this.http.get<ApplicationBoundaryAmendmentDto[]>(`${this.url}/application/${fileNumber}`),
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch boundary amendments');
    }
    return [];
  }

  async create(fileNumber: string, createDto: CreateApplicationBoundaryAmendmentDto) {
    try {
      return await firstValueFrom(
        this.http.post<ApplicationBoundaryAmendmentDto>(`${this.url}/application/${fileNumber}`, createDto),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to create boundary amendment');
      console.log(e);
    }
    return;
  }

  async update(uuid: string, updateDto: UpdateApplicationBoundaryAmendmentDto) {
    try {
      return await firstValueFrom(this.http.patch<ApplicationBoundaryAmendmentDto>(`${this.url}/${uuid}`, updateDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update boundary amendment');
      console.log(e);
    }
    return;
  }

  async delete(uuid: string) {
    try {
      return await firstValueFrom(this.http.delete<ApplicationBoundaryAmendmentDto>(`${this.url}/${uuid}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete boundary amendment');
      console.log(e);
    }
    return;
  }
}
