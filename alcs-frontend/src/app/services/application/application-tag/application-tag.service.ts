import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastService } from '../../toast/toast.service';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { TagDto } from '../../tag/tag.dto';
import { ApplicationTagDto } from './application-tag.dto';
import { FileTagService } from '../../common/file-tag.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationTagService extends FileTagService {
  private baseUrl = `${environment.apiUrl}/application`;
  private tagUrl = 'tag';

  constructor(http: HttpClient, toastService: ToastService) {
    super(http, toastService);
  }

  async getTags(fileNumber: string) {
    const requestUrl = `${this.baseUrl}/${fileNumber}/${this.tagUrl}`;
    try {
      return await firstValueFrom(this.http.get<TagDto[]>(requestUrl));
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.toastService.showErrorToast(`Application with File ID ${fileNumber} was not found!`);
      } else {
        this.toastService.showErrorToast('Failed to retrieve the application');
      }
    }
    return;
  }

  async addTag(fileNumber: string, applicationTagDto: ApplicationTagDto) {
    const requestUrl = `${this.baseUrl}/${fileNumber}/${this.tagUrl}`;
    try {
      return await firstValueFrom(this.http.post<TagDto[]>(requestUrl, applicationTagDto));
    } catch (e) {
      if (e instanceof HttpErrorResponse && (e.status === 404 || e.status === 400)) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to add tag to the application');
      }
    }

    return;
  }

  async deleteTag(fileNumber: string, tagName: string) {
    const encodedTagName = encodeURIComponent(tagName);
    const requestUrl = `${this.baseUrl}/${fileNumber}/${this.tagUrl}/${encodedTagName}`;
    try {
      return await firstValueFrom(this.http.delete<TagDto[]>(requestUrl));
    } catch (e) {
      if (e instanceof HttpErrorResponse && (e.status === 404 || e.status === 400)) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to remove tag to the application');
      }
    }
    return;
  }
}
