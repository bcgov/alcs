import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubtaskDto, UpdateApplicationSubtaskDto } from './application-subtask.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubtaskService {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  private baseUrl = `${environment.apiUrl}/card-subtask`;

  async fetch(cardUuid: string) {
    return firstValueFrom(this.http.get<ApplicationSubtaskDto[]>(`${this.baseUrl}/${cardUuid}`));
  }

  async create(cardUuid: string, type: string) {
    const createdSubtask = firstValueFrom(
      this.http.post<ApplicationSubtaskDto>(`${this.baseUrl}/${cardUuid}/${type}`, {})
    );
    this.toastService.showSuccessToast('Subtask created');
    return createdSubtask;
  }

  async update(uuid: string, update: UpdateApplicationSubtaskDto) {
    const updatedComment = firstValueFrom(this.http.patch<ApplicationSubtaskDto>(`${this.baseUrl}/${uuid}`, update));
    this.toastService.showSuccessToast('Subtask updated');
    return updatedComment;
  }

  async delete(uuid: string) {
    const deleted = firstValueFrom(this.http.delete<ApplicationSubtaskDto>(`${this.baseUrl}/${uuid}`));
    this.toastService.showSuccessToast('Subtask deleted');
    return deleted;
  }
}
