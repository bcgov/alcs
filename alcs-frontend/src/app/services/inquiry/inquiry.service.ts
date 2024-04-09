import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CreateInquiryDto, InquiryDto, InquiryTypeDto, UpdateInquiryDto } from './inquiry.dto';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private url = `${environment.apiUrl}/inquiry`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchTypes() {
    try {
      return await firstValueFrom(this.http.get<InquiryTypeDto[]>(`${this.url}/types`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch inquiry types');
    }
    return;
  }

  async create(meeting: CreateInquiryDto) {
    try {
      const res = await firstValueFrom(this.http.post<InquiryDto>(`${this.url}`, meeting));
      this.toastService.showSuccessToast('Inquiry created');
      return res;
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to create inquiry');
    }
    return;
  }

  async fetch(fileNumber: string) {
    try {
      return await firstValueFrom(this.http.get<InquiryDto>(`${this.url}/${fileNumber}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update inquiry');
    }
    return;
  }

  async fetchByCardUuid(id: string) {
    try {
      return await firstValueFrom(this.http.get<InquiryDto>(`${this.url}/card/${id}`));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch inquiry');
    }
    return;
  }

  async update(fileNumber: string, updateDto: UpdateInquiryDto) {
    try {
      return await firstValueFrom(this.http.patch<InquiryDto>(`${this.url}/${fileNumber}`, updateDto));
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to update inquiry');
    }
    return;
  }
}
