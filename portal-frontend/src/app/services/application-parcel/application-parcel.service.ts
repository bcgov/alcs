import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { ApplicationParcelDto, ApplicationParcelUpdateDto } from './application-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationParcelService {
  private serviceUrl = `${environment.apiUrl}/application-parcel`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService,
    private overlayService: OverlaySpinnerService
  ) {}

  async fetchBySubmissionUuid(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<ApplicationParcelDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Parcel, please try again later');
    }
    return undefined;
  }

  async create(applicationSubmissionUuid: string, ownerUuid?: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<ApplicationParcelDto>(`${this.serviceUrl}`, {
          applicationSubmissionUuid,
          ownerUuid,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(updateDtos: ApplicationParcelUpdateDto[]) {
    try {
      this.overlayService.showSpinner();
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
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }

  async attachCertificateOfTitle(fileId: string, parcelUuid: string, file: File) {
    try {
      const document = await this.documentService.uploadFile<ApplicationDocumentDto | undefined>(
        fileId,
        file,
        DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        DOCUMENT_SOURCE.APPLICANT,
        `${environment.apiUrl}/application-parcel/${parcelUuid}/attachCertificateOfTitle`
      );
      this.toastService.showSuccessToast('Document uploaded');
      return document;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        throw e;
      }
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document to Parcel, please try again');
    }
    return undefined;
  }

  async deleteMany(parcelUuids: string[]) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(
        this.httpClient.delete(`${environment.apiUrl}/application-parcel`, { body: parcelUuids })
      );
      this.toastService.showSuccessToast('Parcel deleted');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete Parcel, please try again');
    } finally {
      this.overlayService.hideSpinner();
    }
    return undefined;
  }
}
