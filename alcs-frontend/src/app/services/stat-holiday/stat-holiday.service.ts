import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatHolidayCreateDto, StatHolidayDto } from './stat-holiday.dto';
import { ToastService } from './toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class StatHolidayService {
  private url = `${environment.apiUrl}/stat-holiday`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $statHolidays = new BehaviorSubject<StatHolidayDto[]>([]);

  async fetch() {
    try {
      const statHolidays = await firstValueFrom(this.http.get<StatHolidayDto[]>(`${this.url}/`));

      this.$statHolidays.next(statHolidays);
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
