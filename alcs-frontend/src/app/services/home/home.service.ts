import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from '../application/application.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient, private settingsService: SettingsService) {}

  async fetchAssignedToMe() {
    return await firstValueFrom(this.http.get<ApplicationDto[]>(`${this.settingsService.settings.apiUrl}/home/assigned`));
  }
}
