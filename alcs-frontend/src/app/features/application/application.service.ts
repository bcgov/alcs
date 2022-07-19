import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationCreateDto, ApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnInit {
  constructor(private http: HttpClient) {}

  public $applications = new BehaviorSubject<ApplicationDto[]>([]);
  public $applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);

  private applications: ApplicationDto[] = [];
  private applicationStatuses: ApplicationStatusDto[] = [];

  ngOnInit(): void {
    this.fetchApplicationStatuses();
    this.fetchApplications();
  }

  private async fetchApplications() {
    this.applications = await firstValueFrom(this.http.get<ApplicationDto[]>(`${environment.apiRoot}/application`));
    this.$applications.next(this.applications);
  }

  private async fetchApplicationStatuses() {
    this.applicationStatuses = await firstValueFrom(
      this.http.get<ApplicationStatusDto[]>(`${environment.apiRoot}/application-status`)
    );
    this.$applicationStatuses.next(this.applicationStatuses);
  }

  async updateApplication(id: string, application: Partial<ApplicationCreateDto>) {
    const updatedApplication = await firstValueFrom(
      this.http.patch<ApplicationDto>(`${environment.apiRoot}/application/${id}`, application)
    );
    this.applications.forEach((app) => {
      if (app.fileNumber === updatedApplication.fileNumber) {
        Object.assign(app, updatedApplication);
      }
    });
    this.$applications.next(this.applications);
  }
}
