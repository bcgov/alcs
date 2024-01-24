import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { openPdfFile } from '../../shared/utils/file';
import { ToastService } from '../toast/toast.service';

interface Report {
  fileName: string;
  data: Blob;
}

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  private serviceUrl = `${environment.apiUrl}/pdf-generation`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService
  ) {}

  async generateAppSubmission(fileNumber: string) {
    return await this.downloadPdf(
      `${this.serviceUrl}/${fileNumber}/submission`,
      `${fileNumber}_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`
    );
  }

  async generateNoiSubmission(fileNumber: string) {
    return await this.downloadPdf(
      `${this.serviceUrl}/${fileNumber}/noi-submission`,
      `${fileNumber}_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`
    );
  }

  async generateReview(fileNumber: string) {
    return await this.downloadPdf(
      `${this.serviceUrl}/${fileNumber}/review`,
      `${fileNumber}-Review_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`
    );
  }

  private async downloadPdf(url: string, fileName: string) {
    try {
      this.overlayService.showSpinner();
      const httpOptions = {
        responseType: 'blob' as 'json',
      };
      const data = await firstValueFrom(this.httpClient.get(url, httpOptions));

      return openPdfFile(fileName, data);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to generate pdf, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }

    return;
  }
}
