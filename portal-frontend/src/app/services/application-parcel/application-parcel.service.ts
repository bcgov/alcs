import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '../application/application.dto';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationParcelDto, ApplicationParcelUpdateDto, PARCEL_TYPE } from './application-parcel.dto';

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

  async create(applicationFileId: string, parcelType?: PARCEL_TYPE, ownerUuid?: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<ApplicationParcelDto>(`${this.serviceUrl}`, { applicationFileId, parcelType, ownerUuid })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(updateDtos: ApplicationParcelUpdateDto[]) {
    try {
      const formattedDtos = updateDtos.map((e) => ({
        ...e,
        mapAreaHectares: e.mapAreaHectares ? parseFloat(e.mapAreaHectares) : e.mapAreaHectares,
      }));

      const result = await firstValueFrom(
        this.httpClient.put<ApplicationParcelDto>(`${this.serviceUrl}`, formattedDtos)
      );

      this.toastService.showSuccessToast('Parcel saved');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Parcel, please try again later');
    }
    return undefined;
  }

  async attachExternalFile(fileId: string, file: File) {
    try {
      const fileUuid = await this.documentService.uploadFile(
        fileId,
        file,
        DOCUMENT.CERTIFICATE_OF_TILE,
        'Applicant',
        `${environment.apiUrl}/application-parcel-document/application/${fileId}/attachExternal`
      );
      this.toastService.showSuccessToast('Document uploaded');
      return fileUuid;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document to Parcel, please try again');
    }
    return undefined;
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
