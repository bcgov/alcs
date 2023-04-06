import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { LocalGovernmentCreateDto, LocalGovernmentDto, LocalGovernmentUpdateDto } from './admin-local-government.dto';

export interface PaginatedLocalGovernmentResponse {
  data: LocalGovernmentDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminLocalGovernmentService {
  private url = `${environment.apiUrl}/admin-local-government`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $localGovernments = new BehaviorSubject<PaginatedLocalGovernmentResponse>({ data: [], total: 0 });

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    const result = await this.search(pageIndex, itemsPerPage, search);
    if (result) {
      this.$localGovernments.next(result);
    }
  }

  async search(pageIndex: number, itemsPerPage: number, search?: string) {
    const searchQuery = search ? `?search=${search}` : '';
    try {
      return await firstValueFrom(
        this.http.get<PaginatedLocalGovernmentResponse>(`${this.url}/${pageIndex}/${itemsPerPage}${searchQuery}`)
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch local governments');
    }
    return;
  }

  async create(dto: LocalGovernmentCreateDto) {
    try {
      return await firstValueFrom(this.http.post<void>(`${this.url}`, dto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create local government');
      console.log(e);
    }
    return;
  }

  async update(uuid: string, dto: LocalGovernmentUpdateDto) {
    try {
      return await firstValueFrom(this.http.put<void>(`${this.url}/${uuid}`, dto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update local government');
      console.log(e);
    }
    return;
  }
}
