import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ComplianceAndEnforcementDocumentDto, UpdateComplianceAndEnforcementDocumentDto } from './document.dto';
import { DOCUMENT_TYPE, DocumentTypeDto } from '../../../shared/document/document.dto';
import { downloadFileFromUrl, openFileInline } from '../../../shared/utils/file';
import { CreateDocumentDto, UpdateDocumentDto } from '../../application/application-document/application-document.dto';

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementDocumentService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/document`;

  constructor(private readonly http: HttpClient) {}

  list(fileNumber?: string, typeCodes: string[] = []): Promise<ComplianceAndEnforcementDocumentDto[]> {
    let params = new HttpParams();

    if (fileNumber) {
      params = params.set('fileNumber', fileNumber);
    }
    for (const typeCode of typeCodes) {
      params = params.append('typeCodes', typeCode);
    }

    return firstValueFrom(this.http.get<ComplianceAndEnforcementDocumentDto[]>(this.url, { params }));
  }

  async update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementDocumentDto,
  ): Promise<ComplianceAndEnforcementDocumentDto> {
    return firstValueFrom(this.http.patch<ComplianceAndEnforcementDocumentDto>(`${this.url}/${uuid}`, updateDto));
  }

  async upload(fileNumber: string, createDto: CreateDocumentDto): Promise<ComplianceAndEnforcementDocumentDto> {
    let formData = this.convertDtoToFormData(createDto);

    return firstValueFrom(this.http.post<ComplianceAndEnforcementDocumentDto>(`${this.url}/${fileNumber}`, formData));
  }

  async download(uuid: string, fileName: string, isInline: boolean) {
    const url = isInline ? `${this.url}/${uuid}/open` : `${this.url}/${uuid}/download`;
    const data = await firstValueFrom(this.http.get<{ url: string }>(url));

    if (isInline) {
      openFileInline(data.url, fileName);
    } else {
      downloadFileFromUrl(data.url, fileName);
    }
  }

  async fetchTypes(allowedCodes: DOCUMENT_TYPE[] = []): Promise<DocumentTypeDto[]> {
    let params = new HttpParams();

    for (const typeCode of allowedCodes) {
      params = params.append('allowedCodes', typeCode);
    }

    return firstValueFrom(this.http.get<DocumentTypeDto[]>(`${this.url}/types`, { params }));
  }

  async delete(uuid: string): Promise<ComplianceAndEnforcementDocumentDto> {
    return firstValueFrom(this.http.delete<ComplianceAndEnforcementDocumentDto>(`${this.url}/${uuid}`));
  }

  private convertDtoToFormData(dto: UpdateDocumentDto | CreateDocumentDto): FormData {
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
