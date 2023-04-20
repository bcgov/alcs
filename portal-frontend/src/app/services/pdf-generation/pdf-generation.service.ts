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

  async generateSubmission(fileNumber: string) {
    try {
      this.overlayService.showSpinner();
      const httpOptions = {
        responseType: 'blob' as 'json',
      };
      const data = await firstValueFrom(
        this.httpClient.get(`${this.serviceUrl}/${fileNumber}/submission`, httpOptions)
      );

      return openPdfFile(`${fileNumber}_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`, data);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to generate pdf, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }

    return;
  }

  async generateReview(fileNumber: string) {
    try {
      this.overlayService.showSpinner();
      const httpOptions = {
        responseType: 'blob' as 'json',
      };
      const data = await firstValueFrom(this.httpClient.get(`${this.serviceUrl}/${fileNumber}/review`, httpOptions));

      return openPdfFile(`${fileNumber}-Review_${moment().format('MMM_DD_YYYY_hh-mm_Z')}`, data);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to generate pdf, please try again later');
    } finally {
      this.overlayService.hideSpinner();
    }

    return;
  }
}
