import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationSubtaskWithApplicationDto } from '../application/application-subtask/application-subtask.dto';
import { ApplicationDto } from '../application/application.dto';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  async fetchAssignedToMe() {
    return await firstValueFrom(
      this.http.get<{ applications: ApplicationDto[]; reconsiderations: ApplicationReconsiderationDto[] }>(
        `${environment.apiUrl}/home/assigned`
      )
    );
  }

  async fetchGisSubtasks() {
    return await firstValueFrom(
      this.http.get<ApplicationSubtaskWithApplicationDto[]>(`${environment.apiUrl}/home/subtask`)
    );
  }
}
