import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { CardSubtaskDto, UpdateApplicationSubtaskDto } from './card-subtask.dto';

@Injectable({
  providedIn: 'root',
})
export class CardSubtaskService {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  private baseUrl = `${environment.apiUrl}/card-subtask`;

  async fetch(cardUuid: string) {
    return firstValueFrom(this.http.get<CardSubtaskDto[]>(`${this.baseUrl}/${cardUuid}`));
  }

  async create(cardUuid: string, type: string) {
    try {
      const createdSubtask = await firstValueFrom(
        this.http.post<CardSubtaskDto>(`${this.baseUrl}/${cardUuid}/${type}`, {})
      );
      this.toastService.showSuccessToast('Subtask created');
      return createdSubtask;
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create Subtask');
    }
    return;
  }

  async update(uuid: string, update: UpdateApplicationSubtaskDto) {
    const updatedComment = firstValueFrom(this.http.patch<CardSubtaskDto>(`${this.baseUrl}/${uuid}`, update));
    this.toastService.showSuccessToast('Subtask updated');
    return updatedComment;
  }

  async delete(uuid: string) {
    const deleted = firstValueFrom(this.http.delete<CardSubtaskDto>(`${this.baseUrl}/${uuid}`));
    this.toastService.showSuccessToast('Subtask deleted');
    return deleted;
  }
}
