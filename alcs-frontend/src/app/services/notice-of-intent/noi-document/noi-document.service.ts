import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentTypeDto } from '../../../shared/document/document.dto';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { verifyFileSize } from '../../../shared/utils/file-size-checker';
import { ToastService } from '../../toast/toast.service';
import {
  NoticeOfIntentDocumentDto,
  CreateNoticeOfIntentDocumentDto,
  UpdateNoticeOfIntentDocumentDto,
} from './noi-document.dto';

@Injectable({
  providedIn: 'root',
})
export class NoiDocumentService {
  private url = `${environment.apiUrl}/notice-of-intent-document`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async listAll(fileNumber: string) {
    return firstValueFrom(this.http.get<NoticeOfIntentDocumentDto[]>(`${this.url}/noi/${fileNumber}`));
  }

  async listByVisibility(fileNumber: string, visibilityFlags: string[]) {
    return firstValueFrom(
      this.http.get<NoticeOfIntentDocumentDto[]>(`${this.url}/noi/${fileNumber}/${visibilityFlags.join()}`)
    );
  }

  async upload(fileNumber: string, createDto: CreateNoticeOfIntentDocumentDto) {
    const file = createDto.file;
    const isValidSize = verifyFileSize(file, this.toastService);
    if (!isValidSize) {
      return;
    }
    let formData = this.convertDtoToFormData(createDto);

    const res = await firstValueFrom(this.http.post(`${this.url}/noi/${fileNumber}`, formData));
    this.toastService.showSuccessToast('Document uploaded');
    return res;
  }

  async delete(uuid: string) {
    return firstValueFrom(this.http.delete<NoticeOfIntentDocumentDto>(`${this.url}/${uuid}`));
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
    return firstValueFrom(this.http.get<NoticeOfIntentDocumentDto[]>(`${this.url}/noi/${fileNumber}/reviewDocuments`));
  }

  async getApplicantDocuments(fileNumber: string) {
    return firstValueFrom(
      this.http.get<NoticeOfIntentDocumentDto[]>(`${this.url}/noi/${fileNumber}/applicantDocuments`)
    );
  }

  async fetchTypes() {
    return firstValueFrom(this.http.get<DocumentTypeDto[]>(`${this.url}/types`));
  }

  async update(uuid: string, updateDto: UpdateNoticeOfIntentDocumentDto) {
    let formData = this.convertDtoToFormData(updateDto);
    const res = await firstValueFrom(this.http.post(`${this.url}/${uuid}`, formData));
    this.toastService.showSuccessToast('Document uploaded');
    return res;
  }

  private convertDtoToFormData(dto: UpdateNoticeOfIntentDocumentDto) {
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
