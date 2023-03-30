import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { getPdfFile } from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSubmissionDocumentGenerationService {
  private serviceUrl = `${environment.apiUrl}/generate-submission-document`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async generate(fileNumber: string) {
    try {
      this.overlayService.showSpinner();
      const httpOptions = {
        responseType: 'blob' as 'json',
      };
      const data = await firstValueFrom(this.httpClient.get(`${this.serviceUrl}/${fileNumber}`, httpOptions));
      // TODO return file name and data from request
      return getPdfFile('demo', data);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to generate pdf, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }

    return;
  }
}
