import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import { ApplicationSubmissionDto, CovenantTransfereeDto, UpdateApplicationSubmissionDto } from '../application.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionService {
  private baseUrl = `${environment.apiUrl}/application-submission`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async fetchSubmission(fileNumber: string): Promise<ApplicationSubmissionDto> {
    try {
      return firstValueFrom(this.http.get<ApplicationSubmissionDto>(`${this.baseUrl}/${fileNumber}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Submission');
      throw e;
    }
  }

  update(fileNumber: string, update: UpdateApplicationSubmissionDto) {
    try {
      return firstValueFrom(this.http.patch<ApplicationSubmissionDto>(`${this.baseUrl}/${fileNumber}`, update));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update Application Submission');
      throw e;
    }
  }

  async fetchTransferees(fileNumber: string) {
    try {
      return firstValueFrom(this.http.get<CovenantTransfereeDto[]>(`${this.baseUrl}/${fileNumber}/transferee`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch Application Transfrees');
      throw e;
    }
  }

  returnToLfng(fileNumber: string, returnComment: string) {
    try {
      return firstValueFrom(
        this.http.post<ApplicationSubmissionDto>(`${this.baseUrl}/${fileNumber}/return`, {
          returnComment,
        }),
      );
    } catch (e) {
      this.toastService.showErrorToast('Failed to return Application Submission');
      throw e;
    }
  }
}
