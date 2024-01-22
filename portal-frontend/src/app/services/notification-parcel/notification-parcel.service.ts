import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { DocumentService } from '../document/document.service';
import { ToastService } from '../toast/toast.service';
import { NotificationParcelDto, NotificationParcelUpdateDto } from './notification-parcel.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationParcelService {
  private serviceUrl = `${environment.apiUrl}/notification-parcel`;

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private documentService: DocumentService,
    private overlayService: OverlaySpinnerService
  ) {}

  async fetchBySubmissionUuid(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<NotificationParcelDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Parcel, please try again later');
    }
    return undefined;
  }

  async create(notificationSubmissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<NotificationParcelDto>(`${this.serviceUrl}`, {
          notificationSubmissionUuid: notificationSubmissionUuid,
        })
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Parcel, please try again later');
      return undefined;
    }
  }

  async update(updateDtos: NotificationParcelUpdateDto[]) {
    try {
      this.overlayService.showSpinner();
      const formattedDtos = updateDtos.map((e) => ({
        ...e,
        mapAreaHectares: e.mapAreaHectares ? parseFloat(e.mapAreaHectares) : e.mapAreaHectares,
      }));

      const result = await firstValueFrom(
        this.httpClient.put<NotificationParcelDto>(`${this.serviceUrl}`, formattedDtos)
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
