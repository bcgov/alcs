import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { verifyFileSize } from '../../../shared/utils/file-size-checker';
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
  ORIGINAL_APPLICATION = 'ORIG',

  //Government Review
  RESOLUTION_DOCUMENT = 'RESO',
  STAFF_REPORT = 'STFF',

  //Applicant Uploaded
  CORPORATE_SUMMARY = 'CORS',
  PROFESSIONAL_REPORT = 'PROR',
  PHOTOGRAPH = 'PHTO',
  AUTHORIZATION_LETTER = 'AAGR',
  CERTIFICATE_OF_TITLE = 'CERT',

  //App Documents
  SERVING_NOTICE = 'POSN',
  PROPOSAL_MAP = 'PRSK',
  HOMESITE_SEVERANCE = 'HOME',
  CROSS_SECTIONS = 'SPCS',
  RECLAMATION_PLAN = 'RECP',
  NOTICE_OF_WORK = 'NOWE',
}

export enum DOCUMENT_SOURCE {
  APPLICANT = 'Applicant',
  ALC = 'ALC',
  LFNG = 'L/FNG',
  AFFECTED_PARTY = 'Affected Party',
  PUBLIC = 'Public',
}

export enum DOCUMENT_SYSTEM {
  ALCS = 'ALCS',
  PORTAL = 'Portal',
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

  async listByVisibility(fileNumber: string, visibilityFlags: string[]) {
    return firstValueFrom(
      this.http.get<ApplicationDocumentDto[]>(`${this.url}/application/${fileNumber}/${visibilityFlags.join()}`)
    );
  }

  async upload(fileNumber: string, createDto: CreateDocumentDto) {
    const file = createDto.file;
    const isValidSize = verifyFileSize(file, this.toastService);
    if (!isValidSize) {
      return;
    }
    let formData = this.convertDtoToFormData(createDto);

    const res = await firstValueFrom(this.http.post(`${this.url}/application/${fileNumber}`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
    return res;
  }

  async delete(uuid: string) {
    return firstValueFrom(this.http.delete<ApplicationDocumentDto>(`${this.url}/${uuid}`));
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

  async update(uuid: string, updateDto: UpdateDocumentDto) {
    let formData = this.convertDtoToFormData(updateDto);
    const res = await firstValueFrom(this.http.post(`${this.url}/${uuid}`, formData));
    this.toastService.showSuccessToast('Review document uploaded');
    return res;
  }

  async updateSort(sortOrder: { uuid: string; order: number }[]) {
    try {
      await firstValueFrom(this.http.post<ApplicationDocumentTypeDto[]>(`${this.url}/sort`, sortOrder));
    } catch (e) {
      this.toastService.showErrorToast(`Failed to save document order`);
    }
  }

  private convertDtoToFormData(dto: UpdateDocumentDto) {
    let formData: FormData = new FormData();
    formData.append('documentType', dto.typeCode);
    formData.append('source', dto.source);
    formData.append('visibilityFlags', dto.visibilityFlags.join(', '));
    formData.append('fileName', dto.fileName);
    if (dto.file) {
      formData.append('file', dto.file, dto.file.name);
    }
    if (dto.parcelUuid) {
      formData.append('parcelUuid', dto.parcelUuid);
    }
    if (dto.ownerUuid) {
      formData.append('ownerUuid', dto.ownerUuid);
    }
    return formData;
  }
}
