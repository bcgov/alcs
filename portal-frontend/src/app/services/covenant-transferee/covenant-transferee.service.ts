import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import {
  CovenantTransfereeCreateDto,
  CovenantTransfereeDto,
  CovenantTransfereeUpdateDto,
} from './covenant-transferee.dto';

@Injectable({
  providedIn: 'root',
})
export class CovenantTransfereeService {
  private serviceUrl = `${environment.apiUrl}/covenant-transferee`;

  constructor(private httpClient: HttpClient, private toastService: ToastService) {}
  async fetchBySubmissionId(submissionUuid: string) {
    try {
      return await firstValueFrom(
        this.httpClient.get<CovenantTransfereeDto[]>(`${this.serviceUrl}/submission/${submissionUuid}`)
      );
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Transferees, please try again later');
    }
    return undefined;
  }

  async create(dto: CovenantTransfereeCreateDto) {
    try {
      const res = await firstValueFrom(this.httpClient.post<CovenantTransfereeDto>(`${this.serviceUrl}`, dto));
      this.toastService.showSuccessToast('Transferee created');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to create Transferee, please try again later');
      return undefined;
    }
  }

  async update(uuid: string, updateDto: CovenantTransfereeUpdateDto) {
    try {
      const res = await firstValueFrom(
        this.httpClient.patch<CovenantTransfereeDto>(`${this.serviceUrl}/${uuid}`, updateDto)
      );
      this.toastService.showSuccessToast('Transferee saved');
      return res;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to update Transferee, please try again later');
      return undefined;
    }
  }
  async delete(uuid: string) {
    try {
      const result = await firstValueFrom(this.httpClient.delete(`${this.serviceUrl}/${uuid}`));
      this.toastService.showSuccessToast('Transferees deleted');
      return result;
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to delete Transferee, please try again');
    }
    return undefined;
  }

  sortOwners(a: CovenantTransfereeDto, b: CovenantTransfereeDto) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
  }
}
