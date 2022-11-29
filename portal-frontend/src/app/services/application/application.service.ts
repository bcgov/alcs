import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto, CreateApplicationDto } from './application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private serviceUrl = `${environment.apiUrl}/application`;

  constructor(private httpClient: HttpClient) {}

  async createPendingApplication(createDto: CreateApplicationDto) {
    let formData: FormData = new FormData();
    formData.append('applicant', createDto.applicant);
    formData.append('localGovernment', createDto.localGovernmentUuid);
    if (createDto.documents.length > 0) {
      formData.append('certificateOfTitle', createDto.documents[0], createDto.documents[0].name);
    }

    try {
      await firstValueFrom(this.httpClient.post<ApplicationDto>(`${this.serviceUrl}`, formData));
      //this.toastService.showSuccessToast('Decision created');
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 400 && e.error?.message) {
        //this.toastService.showErrorToast(e.error.message);
      } else {
        //this.toastService.showErrorToast(`Failed to create decision`);
      }
      throw e;
    }
  }
}
