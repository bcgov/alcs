import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CovenantDto, CreateCovenantDto } from './covenant.dto';

@Injectable({
  providedIn: 'root',
})
export class CovenantService {
  private url = `${environment.apiUrl}/covenant`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async create(covenant: CreateCovenantDto) {
    try {
      return await firstValueFrom(this.http.post<CovenantDto>(`${this.url}`, covenant));
    } catch (e) {
      console.error(e);
      if (e instanceof HttpErrorResponse && e.status === 400) {
        this.toastService.showErrorToast(`Covenant/Application/NOI with File ID ${covenant.fileNumber} already exists`);
      } else {
        this.toastService.showErrorToast('Failed to create Covenant');
      }
      throw e;
    }
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<CovenantDto>(`${this.url}/card/${id}`));
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to fetch covenant');
    }
    return;
  }
}
