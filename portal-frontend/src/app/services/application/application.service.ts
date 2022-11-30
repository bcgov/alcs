import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private serviceUrl = `${environment.apiUrl}/application`;

  constructor(private httpClient: HttpClient) {}

  async create() {
    try {
      return firstValueFrom(this.httpClient.post<{ fileId: string }>(`${this.serviceUrl}`, {}));
    } catch (e) {
      //Do something
    }
    return undefined;
  }

  async updatePending(fileId: string, createDto: UpdateApplicationDto) {
    let formData: FormData = new FormData();
    formData.append('applicant', createDto.applicant);
    formData.append('localGovernment', createDto.localGovernmentUuid);
    if (createDto.documents.length > 0) {
      formData.append('certificateOfTitle', createDto.documents[0], createDto.documents[0].name);
    }

    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}/${fileId}`, formData));
    } catch (e) {
      //Do Something
    }
  }

  async getApplications() {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto[]>(`${this.serviceUrl}`));
    } catch (e) {
      //Do something
      return [];
    }
  }

  async getByFileId(fileId: string) {
    try {
      return await firstValueFrom(this.httpClient.get<ApplicationDto>(`${this.serviceUrl}/${fileId}`));
    } catch (e) {
      //Do something
      return undefined;
    }
  }
}
