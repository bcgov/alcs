import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { ApplicationStatusDto } from './application-submission-status/application-submission-status.dto';
import { ApplicationDto, CreateApplicationDto, UpdateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  $cardStatuses = new BehaviorSubject<CardStatusDto[]>([]);
  $applicationTypes = new BehaviorSubject<ApplicationTypeDto[]>([]);
  $applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);
  $applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);
  private baseUrl = `${environment.apiUrl}/application`;
  private statuses: CardStatusDto[] = [];
  private types: ApplicationTypeDto[] = [];
  private regions: ApplicationRegionDto[] = [];
  private applicationStatuses: ApplicationStatusDto[] = [];
  private isInitialized = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchApplication(fileNumber: string): Promise<ApplicationDto> {
    await this.setup();
    return firstValueFrom(this.http.get<ApplicationDto>(`${this.baseUrl}/${fileNumber}`));
  }

  async createApplication(application: CreateApplicationDto) {
    await this.setup();
    try {
      return await firstValueFrom(this.http.post<ApplicationDto>(`${this.baseUrl}`, application));
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400) {
        this.toastService.showErrorToast(`Application/NOI with File ID ${application.fileNumber} already exists`);
      } else {
        this.toastService.showErrorToast('Failed to create Application');
      }
      throw e;
    }
  }

  async updateApplication(fileNumber: string, application: UpdateApplicationDto) {
    await this.setup();
    try {
      return await firstValueFrom(this.http.patch<ApplicationDto>(`${this.baseUrl}/${fileNumber}`, application));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
    return;
  }

  async updateApplicationCard(cardUuid: string, application: UpdateApplicationDto) {
    await this.setup();
    try {
      return await firstValueFrom(this.http.patch<ApplicationDto>(`${this.baseUrl}/card/${cardUuid}`, application));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application');
    }
    return;
  }

  searchApplicationsByNumber(fileNumber: string) {
    return firstValueFrom(this.http.get<ApplicationDto[]>(`${this.baseUrl}/search/${fileNumber}`));
  }

  async fetchByCardUuid(uuid: string) {
    return firstValueFrom(this.http.get<ApplicationDto>(`${this.baseUrl}/card/${uuid}`));
  }

  async setup() {
    if (!this.isInitialized) {
      await this.fetchCodes();
      this.isInitialized = true;
    }
  }

  async cancelApplication(fileNumber: string) {
    await this.setup();
    try {
      return await firstValueFrom(this.http.post<ApplicationDto>(`${this.baseUrl}/${fileNumber}/cancel`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to cancel Application');
    }
    return;
  }

  async uncancelApplication(fileNumber: string) {
    await this.setup();
    try {
      return await firstValueFrom(this.http.post<ApplicationDto>(`${this.baseUrl}/${fileNumber}/uncancel`, {}));
    } catch (e) {
      this.toastService.showErrorToast('Failed to uncancel Application');
    }
    return;
  }

  private async fetchCodes() {
    const codes = await firstValueFrom(this.http.get<ApplicationMasterCodesDto>(`${environment.apiUrl}/code`));
    this.statuses = codes.status;
    this.$cardStatuses.next(this.statuses);

    this.types = codes.type;
    this.$applicationTypes.next(this.types);

    this.regions = codes.region;
    this.$applicationRegions.next(this.regions);

    this.applicationStatuses = codes.applicationStatusType;
    this.$applicationStatuses.next(this.applicationStatuses);
  }
}
