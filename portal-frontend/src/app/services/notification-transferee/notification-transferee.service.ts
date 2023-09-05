import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../shared/dto/document.dto';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import {
  NotificationOwnerCreateDto,
  NotificationTransfereeDto,
  NotificationOwnerUpdateDto,
  SetPrimaryContactDto,
} from './notification-transferee.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationTransfereeService {
  private serviceUrl = `${environment.apiUrl}/notification-transferee`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService
  ) {}
  async fetchBySubmissionId(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NotificationTransfereeDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Owners, please try again later');
    }
    return undefined;
  }

  async create(dto: NotificationOwnerCreateDto) {
    try {
      const res = await firstValueFrom(this.httpClient.post<NotificationTransfereeDto>(`${this.serviceUrl}`, dto));
      this.toastService.showSuccessToast('Owner created');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Owner, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: NotificationOwnerUpdateDto) {
    try {
      const res = await firstValueFrom(
        this.httpClient.patch<NotificationTransfereeDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('Owner saved');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Owner, please try again later');
      return undefined;
    }
  }

  async setPrimaryContact(updateDto: SetPrimaryContactDto) {
    try {
      const res = await firstValueFrom(
        this.httpClient.post<NotificationTransfereeDto>(`${this.serviceUrl}/setPrimaryContact`, updateDto)
      );
      this.toastService.showSuccessToast('Notice of Intent saved');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Notice of Intent, please try again later');
      return undefined;
    }
  }

  async delete(uuid: string) {
    try {
      const result = await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}/${uuid}`));
      this.toastService.showSuccessToast('Owner deleted');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete Owner, please try again');
    }
    return undefined;
  }

  async removeFromParcel(ownerUuid: string, parcelUuid: string) {
    try {
      const result = await firstValueFrom(
        this.httpClient.post(`${this.serviceUrl}/${ownerUuid}/unlink/${parcelUuid}`, {})
      );
      this.toastService.showSuccessToast('Owner removed from parcel');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to remove Owner, please try again');
    }
    return undefined;
  }

  async linkToParcel(ownerUuid: any, parcelUuid: string) {
    try {
      const result = await firstValueFrom(
        this.httpClient.post(`${this.serviceUrl}/${ownerUuid}/link/${parcelUuid}`, {})
      );
      this.toastService.showSuccessToast('Owner linked to parcel');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to link Owner, please try again');
    }
    return undefined;
  }

  sortOwners(a: NotificationTransfereeDto, b: NotificationTransfereeDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
  }

  async uploadCorporateSummary(noticeOfIntentFileId: string, file: File) {
    try {
      return await this.documentService.uploadFile<{ uuid: string }>(
        noticeOfIntentFileId,
        file,
        DOCUMENT_TYPE.CORPORATE_SUMMARY,
        DOCUMENT_SOURCE.APPLICANT,
        `${this.serviceUrl}/attachCorporateSummary`
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to attach document to Owner, please try again');
    }
    return undefined;
  }
}
