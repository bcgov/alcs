import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DecisionMakerDto } from '../application/decision/application-decision-v1/application-decision.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class DecisionMakerService {
  private url = `${environment.apiUrl}/decision-maker`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<DecisionMakerDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch decision makers');
    }
    return [];
  }

  async create(createDto: DecisionMakerDto) {
    try {
      return await firstValueFrom(this.http.post<DecisionMakerDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create decision maker');
      console.log(e);
    }
    return;
  }

  async update(code: string, updateDto: DecisionMakerDto) {
    try {
      return await firstValueFrom(this.http.patch<DecisionMakerDto>(`${this.url}/${code}`, updateDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update decision maker');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<DecisionMakerDto>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete decision maker');
      console.log(e);
    }
    return;
  }
}
