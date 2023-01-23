import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import {
  APPLICATION_PARCEL_DOCUMENT,
  ApplicationParcelDto,
  ApplicationParcelUpdateDto,
} from './application-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationParcelService {
  private serviceUrl = `${environment.apiUrl}/application-parcel`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService
  ) {}

  async fetchByFileId(applicationFileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<ApplicationParcelDto[]>(`${this.serviceUrl}/application/${applicationFileId}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Parcel, please try again later');
    }
    return undefined;
  }

  async create(applicationFileId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<ApplicationParcelDto>(`${this.serviceUrl}`, { applicationFileId })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: ApplicationParcelUpdateDto) {
    try {
      return await firstValueFrom(
        this.httpClient.put<ApplicationParcelDto>(`${this.serviceUrl}/${uuid}`, {
          ...updateDto,
          mapAreaHectares: updateDto.mapAreaHectares
            ? parseFloat(updateDto.mapAreaHectares)
            : updateDto.mapAreaHectares,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Parcel, please try again later');
      return undefined;
    }
  }

  async attachExternalFile(fileId: string, files: File[], documentType: APPLICATION_PARCEL_DOCUMENT) {
    if (files.length > 0) {
      const file: File = files[0];

      if (file.size > environment.maxFileSize) {
        const niceSize = environment.maxFileSize / 1048576;
        this.toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
        return;
      }

      try {
        const fileKey = await this.documentService.uploadFileToStorage(fileId, file, documentType);

        // create document metadata record in PORTAL.
        // Document record will be created in ALCS, however the link between application and document will be in PORTAL till application submitted to ALCS
        await firstValueFrom(
          this.httpClient.post(
            `${environment.apiUrl}/application-parcel-document/application/${fileId}/attachExternal`,
            {
              documentType: documentType,
              mimeType: file.type,
              fileName: file.name,
              fileSize: file.size,
              fileKey: fileKey,
              source: 'Applicant',
            }
          )
        );
        this.toastService.showSuccessToast('Document uploaded');
      } catch (e) {
        console.error(e);
        this.toastService.showErrorToast('Failed to attach document to Parcel, please try again');
      }
    }
  }

  async openFile(fileUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{ url: string }>(`${environment.apiUrl}/application-parcel-document/${fileUuid}/open`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to open the document, please try again');
    }
    return undefined;
  }

  async deleteExternalFile(fileUuid: string) {
    try {
      await firstValueFrom(this.httpClient.delete(`${environment.apiUrl}/application-parcel-document/${fileUuid}`));
      this.toastService.showSuccessToast('Document deleted');
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete document, please try again');
    }
  }

  async delete(parcelUuid: string) {
    try {
      const result = await firstValueFrom(
        this.httpClient.delete(`${environment.apiUrl}/application-parcel/${parcelUuid}`)
      );
      this.toastService.showSuccessToast('Parcel deleted');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete Parcel, please try again');
    }
    return undefined;
  }
}
