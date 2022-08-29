import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
import {
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
  constructor(private http: HttpClient, private toastService: ToastService, private settingsService: SettingsService) {}

  public $applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);
  public $applicationTypes = new BehaviorSubject<ApplicationTypeDto[]>([]);
  public $applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

  private statuses: ApplicationStatusDto[] = [];
  private types: ApplicationTypeDto[] = [];
  private regions: ApplicationRegionDto[] = [];
  private isInitialized = false;

  async updateApplication(application: ApplicationPartialDto) {
    await this.setup();
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDetailedDto>(`${this.settingsService.settings.apiUrl}/application`, application)
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
    return;
  }

  async fetchApplication(fileNumber: string): Promise<ApplicationDetailedDto> {
    await this.setup();
    return firstValueFrom(this.http.get<ApplicationDetailedDto>(`${this.settingsService.settings.apiUrl}/application/${fileNumber}`));
  }

  async createApplication(application: CreateApplicationDto) {
    await this.setup();
    return await firstValueFrom(
      this.http.post<ApplicationDetailedDto>(`${this.settingsService.settings.apiUrl}/application`, application)
    );
  }

  async setup() {
    if (!this.isInitialized) {
      await this.fetchCodes();
      this.isInitialized = true;
    }
  }

  private async fetchCodes() {
    const codes = await firstValueFrom(
      this.http.get<ApplicationMasterCodesDto>(`${this.settingsService.settings.apiUrl}/application-code`)
    );
    this.statuses = codes.status;
    this.$applicationStatuses.next(this.statuses);

    this.types = codes.type;
    this.$applicationTypes.next(this.types);

    this.regions = codes.region;
    this.$applicationRegions.next(this.regions);
  }
}
