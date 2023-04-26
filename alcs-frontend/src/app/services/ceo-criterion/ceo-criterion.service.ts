import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CeoCriterionDto } from '../application/decision/application-decision-v1/application-decision.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CeoCriterionService {
  private url = `${environment.apiUrl}/ceo-criterion`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<CeoCriterionDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch stat holidays');
    }
    return [];
  }

  async create(createDto: CeoCriterionDto) {
    try {
      return await firstValueFrom(this.http.post<CeoCriterionDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create ceo criterion');
      console.log(e);
    }
    return;
  }

  async update(code: string, updateDto: CeoCriterionDto) {
    try {
      return await firstValueFrom(this.http.patch<CeoCriterionDto>(`${this.url}/${code}`, updateDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update ceo criterion');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<CeoCriterionDto>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete ceo criterion');
      console.log(e);
    }
    return;
  }
}
