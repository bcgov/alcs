import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { firstValueFrom } from 'rxjs';
import { IncomingFileBoardMapDto } from './incomig-file.dto';

@Injectable({
  providedIn: 'root',
})
export class IncomingFileService {
  private url = `${environment.apiUrl}/incoming-files`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetch() {
    try {
      return await firstValueFrom(this.http.get<IncomingFileBoardMapDto>(`${this.url}`));
    } catch (err) {
      this.toastService.showErrorToast('Failed to fetch incoming files');
    }
    return;
  }
}
