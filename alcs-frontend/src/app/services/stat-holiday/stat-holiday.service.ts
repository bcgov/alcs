import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { StatHolidayCreateDto, StatHolidayDto } from './stat-holiday.dto';

export interface PaginatedHolidayResponse {
  data: StatHolidayDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatHolidayService {
  private url = `${environment.apiUrl}/stat-holiday`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $statHolidays = new BehaviorSubject<PaginatedHolidayResponse>({ data: [], total: 0 });

  async fetch(pageNumber: number, itemsPerPage: number, search?: number) {
    const searchQuery = search ? `?search=${search}` : '';
    try {
      const result = await firstValueFrom(
        this.http.get<PaginatedHolidayResponse>(`${this.url}/${pageNumber}/${itemsPerPage}${searchQuery}`)
      );

      this.$statHolidays.next(result);
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch stat holidays');
    }
  }

  async create(holiday: StatHolidayCreateDto) {
    try {
      return await firstValueFrom(this.http.post<StatHolidayDto>(`${this.url}`, holiday));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create stat holiday');
      console.log(e);
    }
    return;
  }

  async update(holidayUuid: string, holiday: StatHolidayCreateDto) {
    try {
      return await firstValueFrom(this.http.put<StatHolidayDto>(`${this.url}/${holidayUuid}`, holiday));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update stat holiday');
      console.log(e);
    }
    return;
  }

  async delete(holidayUuid: string) {
    try {
      return await firstValueFrom(this.http.delete<StatHolidayDto>(`${this.url}/${holidayUuid}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete stat holiday');
      console.log(e);
    }
    return;
  }
}
