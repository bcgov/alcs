import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CardStatusDto } from '../../application/application-code.dto';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CardStatusService {
  private url = `${environment.apiUrl}/card-status`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<CardStatusDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch card statuses');
    }
    return [];
  }

  async create(createDto: CardStatusDto) {
    try {
      return await firstValueFrom(this.http.post<CardStatusDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create card status');
      console.log(e);
    }
    return;
  }

  async update(code: string, updateDto: CardStatusDto) {
    try {
      return await firstValueFrom(this.http.patch<CardStatusDto>(`${this.url}/${code}`, updateDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update ceo criterion');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<CardStatusDto>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete card status');
      console.log(e);
    }
    return;
  }

  async canDelete(code: string) {
    try {
      return await firstValueFrom(this.http.get<{ canDelete: boolean; reason: string }>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete card status');
      console.log(e);
    }
    return;
  }
}
