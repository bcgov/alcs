import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './application-document.dto';

export enum DOCUMENT_TYPE {
  //ALCS
  DECISION_DOCUMENT = 'DPAC',
  OTHER = 'OTHR',

  //Government Review
  RESOLUTION_DOCUMENT = 'RESO',
  STAFF_REPORT = 'STFF',

  //Applicant Uploaded
  CORPORATE_SUMMARY = 'CORS',
  PROFESSIONAL_REPORT = 'PROR',
  PHOTOGRAPH = 'PHTO',
  AUTHORIZATION_LETTER = 'AAGR',
  CERTIFICATE_OF_TITLE = 'CERT',

  //TUR
  SERVING_NOTICE = 'POSN',
  PROPOSAL_MAP = 'PRSK',
}

export enum DOCUMENT_SOURCE {
  APPLICANT = 'Applicant',
  ALCS = 'ALCS',
  LFNG = 'Local Government',
  AFFECTED_PARTY = 'Affected Party',
  PUBLIC = 'Public',
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationDocumentService {
  private url = `${environment.apiUrl}/application-document`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async listAll(fileNumber: string) {
    return firstValueFrom(this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}`));
  }

  async listByType(fileNumber: string, documentType?: DOCUMENT_TYPE) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/${documentType}`)
    );
  }

  async upload(fileNumber: string, createDto: CreateDocumentDto) {
    const file = createDto.file;
    if (file.size > environment.maxFileSize) {
      const niceSize = environment.maxFileSize / 1048576;
      this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
      return;
    }

    let formData: FormData = new FormData();
    formData.append('documentType', createDto.typeCode);
    formData.append('source', createDto.source);
    formData.append('visibilityFlags', createDto.visibilityFlags.join(', '));
    formData.append('fileName', createDto.fileName);
    formData.append('file', file, file.name);
    const res = await firstValueFrom(this.http.post(`${this.url}/application/${fileNumber}`, formData));
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

  async fetchTypes() {
    return firstValueFrom(this.http.get<ApplicationDocumentTypeDto[]>(`${this.url}/types`));
  }

  async update(uuid: string, createDto: UpdateDocumentDto) {
    let formData: FormData = new FormData();

    const file = createDto.file;
    if (file) {
      if (file.size > environment.maxFileSize) {
        const niceSize = environment.maxFileSize / 1048576;
        this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
        return;
      }
      formData.append('file', file, file.name);
    }
    formData.append('documentType', createDto.typeCode);
    formData.append('source', createDto.source);
    formData.append('visibilityFlags', createDto.visibilityFlags.join(', '));
    formData.append('fileName', createDto.fileName);
    const res = await firstValueFrom(this.http.post(`${this.url}/${uuid}`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
    return res;
  }
}
