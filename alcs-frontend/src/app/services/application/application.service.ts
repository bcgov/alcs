import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import {
  ApplicationDecisionMakerDto,
  ApplicationMasterCodesDto,
  ApplicationRegionDto,
  ApplicationStatusDto,
  ApplicationTypeDto,
} from './application-code.dto';
import { ApplicationDetailedDto, ApplicationDto, ApplicationPartialDto, CreateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient, private toastService: ToastService, private userService: UserService) {
    this.userService.$currentUserProfile.subscribe((user) => {
      this.fetchCodes(user);
    });
  }

  public $applications = new BehaviorSubject<ApplicationDto[]>([]);
  public $applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);
  public $applicationTypes = new BehaviorSubject<ApplicationTypeDto[]>([]);
  public $applicationDecisionMakers = new BehaviorSubject<ApplicationDecisionMakerDto[]>([]);
  public $applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

  private applications: ApplicationDto[] = [];
  private statuses: ApplicationStatusDto[] = [];
  private types: ApplicationTypeDto[] = [];
  private decisionMakers: ApplicationDecisionMakerDto[] = [];
  private regions: ApplicationRegionDto[] = [];
  private isInitialized = false;

  private selectedDecisionMaker?: string;

  setDecisionMaker(dmCode?: string) {
    this.selectedDecisionMaker = dmCode;
  }

  async fetchApplications() {
    await this.setup();

    const url = this.selectedDecisionMaker
      ? `${environment.apiRoot}/application?dm=${this.selectedDecisionMaker}`
      : `${environment.apiRoot}/application?`;

    this.applications = await firstValueFrom(this.http.get<ApplicationDto[]>(url));
    this.$applications.next(this.applications);
  }

  async updateApplication(application: ApplicationPartialDto) {
    await this.setup();
    try {
      await firstValueFrom(this.http.patch<ApplicationDto>(`${environment.apiRoot}/application`, application));
      await this.fetchApplications();
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
  }

  async fetchApplication(fileNumber: string): Promise<ApplicationDetailedDto> {
    await this.setup();
    return firstValueFrom(this.http.get<ApplicationDetailedDto>(`${environment.apiRoot}/application/${fileNumber}`));
  }

  async createApplication(application: CreateApplicationDto) {
    await this.setup();
    const res = await firstValueFrom(
      this.http.post<ApplicationDetailedDto>(`${environment.apiRoot}/application`, application)
    );
    if (!this.selectedDecisionMaker || application.decisionMaker === this.selectedDecisionMaker) {
      this.fetchApplications();
    }
    return res;
  }

  async setup() {
    if (!this.isInitialized) {
      await this.fetchCodes();
      this.isInitialized = true;
    }
  }

  private async fetchCodes(currentUserProfile?: UserDto) {
    const codes = await firstValueFrom(
      this.http.get<ApplicationMasterCodesDto>(`${environment.apiRoot}/application-code`)
    );
    this.statuses = codes.status;
    this.$applicationStatuses.next(this.statuses);

    this.types = codes.type;
    this.$applicationTypes.next(this.types);

    if (currentUserProfile) {
      this.decisionMakers = codes.decisionMaker.map((dm) => {
        return {
          ...dm,
          isFavorite: currentUserProfile.settings.favoriteBoards?.includes(dm.code),
        };
      });
    }
    this.$applicationDecisionMakers.next(this.decisionMakers);

    this.regions = codes.region;
    this.$applicationRegions.next(this.regions);
  }
}
