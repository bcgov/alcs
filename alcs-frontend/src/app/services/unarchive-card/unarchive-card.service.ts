import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';

export type UnarchiveCardSearchResult = {
  cardUuid: string;
  type: string;
  status: string;
  createdAt: number;
};

@Injectable({
  providedIn: 'root',
})
export class UnarchiveCardService {
  private url = `${environment.apiUrl}/unarchive-card`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async search(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<UnarchiveCardSearchResult[]>(`${this.url}/${fileNumber}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to search for cards');
    }
    return [];
  }

  async unarchiveCard(uuid: string) {
    try {
      return await firstValueFrom(
        this.http.patch<{ restored: boolean }>(`${environment.apiUrl}/card/restore/${uuid}`, {})
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to unarchive card');
    }
    return undefined;
  }
}
