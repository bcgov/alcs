import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { DocumentService } from '../document/document.service';
import { NoticeOfIntentDocumentDto } from '../notice-of-intent-document/notice-of-intent-document.dto';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentParcelDto, NoticeOfIntentParcelUpdateDto } from './notice-of-intent-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentParcelService {
  private serviceUrl = `${environment.apiUrl}/notice-of-intent-parcel`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService,
    private overlayService: OverlaySpinnerService
  ) {}

  async fetchBySubmissionUuid(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NoticeOfIntentParcelDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Parcel, please try again later');
    }
    return undefined;
  }

  async create(noticeOfIntentSubmissionUuid: string, ownerUuid?: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<NoticeOfIntentParcelDto>(`${this.serviceUrl}`, {
          noticeOfIntentSubmissionUuid,
          ownerUuid,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(updateDtos: NoticeOfIntentParcelUpdateDto[]) {
    try {
      this.overlayService.showSpinner();
      const formattedDtos = updateDtos.map((e) => ({
        ...e,
        mapAreaHectares: e.mapAreaHectares ? parseFloat(e.mapAreaHectares) : e.mapAreaHectares,
      }));

      const result = await firstValueFrom(
        this.httpClient.put<NoticeOfIntentParcelDto>(`${this.serviceUrl}`, formattedDtos)
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
      const document = await this.documentService.uploadFile<NoticeOfIntentDocumentDto | undefined>(
        fileId,
        file,
        DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        DOCUMENT_SOURCE.APPLICANT,
        `${this.serviceUrl}/${parcelUuid}/attachCertificateOfTitle`
      );
      this.toastService.showSuccessToast('Document uploaded');
      return document;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document to Parcel, please try again');
    }
    return undefined;
  }

  async deleteMany(parcelUuids: string[]) {
    try {
      this.overlayService.showSpinner();
      const result = await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}`, { body: parcelUuids }));
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
