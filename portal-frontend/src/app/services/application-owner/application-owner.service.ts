import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../application-document/application-document.dto';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
  SetPrimaryContactDto,
} from './application-owner.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationOwnerService {
  private serviceUrl = `${environment.apiUrl}/application-owner`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService
  ) {}

  async fetchBySubmissionId(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<ApplicationOwnerDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Owners, please try again later');
    }
    return undefined;
  }

  async create(dto: ApplicationOwnerCreateDto) {
    try {
      const res = await firstValueFrom(this.httpClient.post<ApplicationOwnerDto>(`${this.serviceUrl}`, dto));
      this.toastService.showSuccessToast('Owner created');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Owner, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: ApplicationOwnerUpdateDto) {
    try {
      const res = await firstValueFrom(
        this.httpClient.patch<ApplicationOwnerDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('Owner updated');
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
        this.httpClient.post<ApplicationOwnerDto>(`${this.serviceUrl}/setPrimaryContact`, updateDto)
      );
      this.toastService.showSuccessToast('Primary Contact Updated');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Primary Contact, please try again later');
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

  sortOwners(a: ApplicationOwnerDto, b: ApplicationOwnerDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
  }

  async uploadCorporateSummary(applicationFileId: string, file: File) {
    try {
      return await this.documentService.uploadFile<{ uuid: string }>(
        applicationFileId,
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
