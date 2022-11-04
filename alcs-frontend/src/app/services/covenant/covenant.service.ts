import { HttpClient } from '@angular/common/http';
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

  async create(meeting: CreateCovenantDto) {
    try {
      return await firstValueFrom(this.http.post<CreateCovenantDto>(`${this.url}`, meeting));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create covenant');
    }
    return;
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<CovenantDto>(`${this.url}/card/${id}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch covenant');
    }
    return;
  }
}
