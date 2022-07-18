import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient) {}

  getApplications() {
    return this.http.get<ApplicationDto[]>(`${environment.apiRoot}/application`);
  }

  getApplicationStatuses() {
    return this.http.get<ApplicationStatusDto[]>(`${environment.apiRoot}/application-status`);
  }
}
