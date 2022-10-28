import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationAmendmentCreateDto,
  ApplicationAmendmentDto,
  ApplicationAmendmentUpdateDto,
} from './application-amendment.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationAmendmentService {
  $amendments = new BehaviorSubject<ApplicationAmendmentDto[]>([]);

  private url = `${environment.apiUrl}/application-amendment`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchByApplication(applicationFileNumber: string) {
    try {
      const amendments = await firstValueFrom(
        this.http.get<ApplicationAmendmentDto[]>(`${this.url}/application/${applicationFileNumber}`)
      );
      amendments.sort((a, b) => b.submittedDate - a.submittedDate);
      this.$amendments.next(amendments);
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch amendments');
    }
    return [];
  }

  async fetchByBoard(boardCode: string) {
    try {
      this.$amendments.next(
        await firstValueFrom(this.http.get<ApplicationAmendmentDto[]>(`${this.url}/board/${boardCode}`))
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch amendments');
    }
    return [];
  }

  async fetchByCardUuid(cardUuid: string) {
    try {
      return await firstValueFrom(this.http.get<ApplicationAmendmentDto>(`${this.url}/card/${cardUuid}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch amendment');
    }
    return;
  }

  async update(amendmentUuids: string, updateDto: ApplicationAmendmentUpdateDto) {
    try {
      await firstValueFrom(this.http.patch<ApplicationAmendmentDto>(`${this.url}/${amendmentUuids}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update amendment');
    }
  }

  async create(createDto: ApplicationAmendmentCreateDto) {
    try {
      await firstValueFrom(
        this.http.post<ApplicationAmendmentDto>(this.url, {
          ...createDto,
          submittedDate: formatDateForApi(createDto.submittedDate),
        })
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create amendment');
    }
    return;
  }

  async delete(uuid: string) {
    try {
      await firstValueFrom(this.http.delete<ApplicationAmendmentDto>(`${this.url}/${uuid}`));
      this.toastService.showSuccessToast('Amendment deleted');
    } catch (err) {
      this.toastService.showErrorToast('Failed to delete amendment');
    }
  }
}
