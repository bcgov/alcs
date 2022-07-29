import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationTypeDto } from './application-type.dto';
import { ApplicationDetailedDto, ApplicationDto, ApplicationPartialDto, CreateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnInit {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $applications = new BehaviorSubject<ApplicationDto[]>([]);
  public $applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);
  public $applicationTypes = new BehaviorSubject<ApplicationTypeDto[]>([]);

  private applications: ApplicationDto[] = [];
  private applicationStatuses: ApplicationStatusDto[] = [];
  private applicationTypes: ApplicationTypeDto[] = [];

  ngOnInit(): void {}

  refreshApplications() {
    //Don't load applications till we have status & type
    Promise.all([this.fetchApplicationStatuses(), this.fetchApplicationTypes()]).then(() => {
      this.fetchApplications();
    });
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

  private async fetchApplicationTypes() {
    this.applicationTypes = await firstValueFrom(
      this.http.get<ApplicationTypeDto[]>(`${environment.apiRoot}/application-types`)
    );
    this.$applicationTypes.next(this.applicationTypes);
  }

  async updateApplication(application: ApplicationPartialDto) {
    try {
      const updatedApplication = await firstValueFrom(
        this.http.patch<ApplicationDto>(`${environment.apiRoot}/application`, application)
      );
      this.applications.forEach((app) => {
        if (app.fileNumber === updatedApplication.fileNumber) {
          Object.assign(app, updatedApplication);
        }
      });
      this.$applications.next(this.applications);
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
  }

  async fetchApplication(fileNumber: string): Promise<ApplicationDetailedDto> {
    return firstValueFrom(this.http.get<ApplicationDetailedDto>(`${environment.apiRoot}/application/${fileNumber}`));
  }

  async createApplication(application: CreateApplicationDto) {
    return firstValueFrom(
      this.http.post<ApplicationDetailedDto>(`${environment.apiRoot}/application`, application)
    ).then(() => {
      this.fetchApplications();
    });
  }
}
