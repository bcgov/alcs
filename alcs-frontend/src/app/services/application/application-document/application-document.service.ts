import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';
import { ApplicationDocumentDto } from './application-document.dto';

export enum DOCUMENT_TYPE {
  //ALCS
  DECISION_DOCUMENT = 'decisionDocument',
  REVIEW_DOCUMENT = 'reviewDocument',
  CERTIFICATE_OF_TITLE = 'certificateOfTitle',

  //Government Review
  RESOLUTION_DOCUMENT = 'reviewResolutionDocument',
  STAFF_REPORT = 'reviewStaffReport',
  REVIEW_OTHER = 'reviewOther',

  //Applicant Uploaded
  CORPORATE_SUMMARY = 'corporateSummary',
  PROFESSIONAL_REPORT = 'Professional Report',
  PHOTOGRAPH = 'Photograph',
  OTHER = 'Other',
  AUTHORIZATION_LETTER = 'authorizationLetter',
  SERVING_NOTICE = 'servingNotice',
  PROPOSAL_MAP = 'proposalMap',
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationDocumentService {
  private url = `${environment.apiUrl}/application-document`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async list(fileNumber: string, documentType: DOCUMENT_TYPE) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/${documentType}`)
    );
  }

  async upload(fileNumber: string, documentType: DOCUMENT_TYPE, file: File) {
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return;
    }

    let formData: FormData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/application/${fileNumber}/${documentType}`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
    return res;
  }

  async delete(documentId: string) {
    return firstValueFrom(this.http.delete<ApplicationDocumentDto>(`${this.url}/${documentId}`));
  }

  async download(uuid: string, fileName: string, isInline = true) {
    const url = isInline ? `${this.url}/${uuid}/open` : `${this.url}/${uuid}/download`;
    const data = await firstValueFrom(this.http.get<{ url: string }>(url));
    if (isInline) {
      openFileInline(data.url, fileName);
    } else {
      downloadFileFromUrl(data.url, fileName);
    }
  }

  async getReviewDocuments(fileNumber: string) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/reviewDocuments`)
    );
  }

  async getApplicantDocuments(fileNumber: string) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/applicantDocuments`)
    );
  }
}
