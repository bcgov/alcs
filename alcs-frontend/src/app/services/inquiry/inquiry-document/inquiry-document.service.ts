import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentTypeDto } from '../../../shared/document/document.dto';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { verifyFileSize } from '../../../shared/utils/file-size-checker';
import { ToastService } from '../../toast/toast.service';
import { CreateDocumentDto, InquiryDocumentDto, UpdateDocumentDto } from './inquiry-document.dto';

@Injectable({
  providedIn: 'root',
})
export class InquiryDocumentService {
  private url = `${environment.apiUrl}/inquiry-document`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  async listAll(fileNumber: string) {
    return firstValueFrom(this.http.get<InquiryDocumentDto[]>(`${this.url}/inquiry/${fileNumber}`));
  }

  async upload(fileNumber: string, createDto: CreateDocumentDto) {
    const file = createDto.file;
    const isValidSize = verifyFileSize(file, this.toastService);
    if (!isValidSize) {
      return;
    }
    let formData = this.convertDtoToFormData(createDto);

    const res = await firstValueFrom(this.http.post(`${this.url}/inquiry/${fileNumber}`, formData));
    this.toastService.showSuccessToast('Document uploaded');
    return res;
  }

  async delete(uuid: string) {
    return firstValueFrom(this.http.delete<InquiryDocumentDto>(`${this.url}/${uuid}`));
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

  async fetchTypes() {
    return firstValueFrom(this.http.get<DocumentTypeDto[]>(`${this.url}/types`));
  }

  async update(uuid: string, updateDto: UpdateDocumentDto) {
    let formData = this.convertDtoToFormData(updateDto);
    const res = await firstValueFrom(this.http.post(`${this.url}/${uuid}`, formData));
    this.toastService.showSuccessToast('Document uploaded');
    return res;
  }

  async updateSort(sortOrder: { uuid: string; order: number }[]) {
    try {
      await firstValueFrom(this.http.post<DocumentTypeDto[]>(`${this.url}/sort`, sortOrder));
    } catch (e) {
      this.toastService.showErrorToast(`Failed to save document order`);
    }
  }

  private convertDtoToFormData(dto: UpdateDocumentDto) {
    let formData: FormData = new FormData();
    formData.append('documentType', dto.typeCode);
    formData.append('source', dto.source);
    formData.append('fileName', dto.fileName);
    if (dto.file) {
      formData.append('file', dto.file, dto.file.name);
    }
    return formData;
  }
}
