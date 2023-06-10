import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { HolidayCreateDto, HolidayDto } from './holiday.dto';

export interface PaginatedHolidayResponse {
  data: HolidayDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private url = `${environment.apiUrl}/stat-holiday`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $statHolidays = new BehaviorSubject<PaginatedHolidayResponse>({ data: [], total: 0 });

  async fetch(pageIndex: number, itemsPerPage: number, search?: number) {
    const searchQuery = search ? `?search=${search}` : '';
    this.clearStatHolidays();
    
    try {
      const result = await firstValueFrom(
        this.http.get<PaginatedHolidayResponse>(`${this.url}/${pageIndex}/${itemsPerPage}${searchQuery}`)
      );

      this.$statHolidays.next(result);
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch stat holidays');
    }
  }

  async create(holiday: HolidayCreateDto) {
    try {
      return await firstValueFrom(this.http.post<HolidayDto>(`${this.url}`, holiday));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create stat holiday');
      console.log(e);
    }
    return;
  }

  async update(holidayUuid: string, holiday: HolidayCreateDto) {
    try {
      return await firstValueFrom(this.http.put<HolidayDto>(`${this.url}/${holidayUuid}`, holiday));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update stat holiday');
      console.log(e);
    }
    return;
  }

  async delete(holidayUuid: string) {
    try {
      return await firstValueFrom(this.http.delete<HolidayDto>(`${this.url}/${holidayUuid}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete stat holiday');
      console.log(e);
    }
    return;
  }

  async loadFilterValues() {
    try {
      return await firstValueFrom(this.http.get<{ years: string[] }>(`${this.url}/filters`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to load filter values');
      console.log(e);
    }
    return;
  }

  clearStatHolidays() {
    this.$statHolidays.next({ data: [], total: 0 });
  }
}
