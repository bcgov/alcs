import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  ApplicationMasterCodesDto,
  ApplicationRegionDto,
  ApplicationTypeDto,
  CardStatusDto,
} from './application-code.dto';
import { ApplicationDetailedDto, ApplicationDto, ApplicationPartialDto, CreateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $cardStatuses = new BehaviorSubject<CardStatusDto[]>([]);
  public $applicationTypes = new BehaviorSubject<ApplicationTypeDto[]>([]);
  public $applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

  private statuses: CardStatusDto[] = [];
  private types: ApplicationTypeDto[] = [];
  private regions: ApplicationRegionDto[] = [];
  private isInitialized = false;

  async updateApplication(application: ApplicationPartialDto) {
    await this.setup();
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDetailedDto>(`${environment.apiUrl}/application`, application)
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
    return;
  }

  async updateApplicationCard(application: ApplicationPartialDto) {
    await this.setup();
    try {
      return await firstValueFrom(
        this.http.patch<ApplicationDetailedDto>(`${environment.apiUrl}/application/updateCard`, application)
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
    return;
  }

  async fetchApplication(fileNumber: string): Promise<ApplicationDetailedDto> {
    await this.setup();
    return firstValueFrom(this.http.get<ApplicationDetailedDto>(`${environment.apiUrl}/application/${fileNumber}`));
  }

  async createApplication(application: CreateApplicationDto) {
    await this.setup();
    return await firstValueFrom(
      this.http.post<ApplicationDetailedDto>(`${environment.apiUrl}/application`, application)
    );
  }

  async setup() {
    if (!this.isInitialized) {
      await this.fetchCodes();
      this.isInitialized = true;
    }
  }

  private async fetchCodes() {
    const codes = await firstValueFrom(this.http.get<ApplicationMasterCodesDto>(`${environment.apiUrl}/code`));
    this.statuses = codes.status;
    this.$cardStatuses.next(this.statuses);

    this.types = codes.type;
    this.$applicationTypes.next(this.types);

    this.regions = codes.region;
    this.$applicationRegions.next(this.regions);
  }

  searchApplicationsByNumber(fileNumber: string) {
    return firstValueFrom(this.http.get<ApplicationDto[]>(`${environment.apiUrl}/application/search/${fileNumber}`));
  }
}
