import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CeoCriterionDto } from '../application/decision/application-decision-v1/application-decision.dto';
import { NoticeOfIntentSubtypeDto } from '../notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class NoiSubtypeService {
  private url = `${environment.apiUrl}/noi-subtype`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<NoticeOfIntentSubtypeDto[]>(`${this.url}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch NOI subtypes');
    }
    return [];
  }

  async create(createDto: NoticeOfIntentSubtypeDto) {
    try {
      return await firstValueFrom(this.http.post<NoticeOfIntentSubtypeDto>(`${this.url}`, createDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create NOI subtype');
      console.log(e);
    }
    return;
  }

  async update(code: string, updateDto: NoticeOfIntentSubtypeDto) {
    try {
      return await firstValueFrom(this.http.patch<NoticeOfIntentSubtypeDto>(`${this.url}/${code}`, updateDto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update NOI subtype');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<CeoCriterionDto>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete NOI subtype');
      console.log(e);
    }
    return;
  }
}
