import { Injectable } from '@angular/core';
import { FileTagService } from '../../common/file-tag.service';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../toast/toast.service';
import { firstValueFrom } from 'rxjs';
import { TagDto } from '../../tag/tag.dto';
import { NoticeOfIntentTagDto } from './notice-of-intent-tag.dto';

@Injectable({
  providedIn: 'root',
})
export class NoticeOfIntentTagService extends FileTagService {
  private baseUrl = `${environment.apiUrl}/notice-of-intent`;
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
        this.toastService.showErrorToast(`Notice of Intent with File ID ${fileNumber} was not found!`);
      } else {
        this.toastService.showErrorToast('Failed to retrieve the Notice of Intent');
      }
    }
    return;
  }

  async addTag(fileNumber: string, noiTagDto: NoticeOfIntentTagDto) {
    const requestUrl = `${this.baseUrl}/${fileNumber}/${this.tagUrl}`;
    try {
      return await firstValueFrom(this.http.post<TagDto[]>(requestUrl, noiTagDto));
    } catch (e) {
      if (e instanceof HttpErrorResponse && (e.status === 404 || e.status === 400)) {
        this.toastService.showErrorToast(e.error.message);
      } else {
        this.toastService.showErrorToast('Failed to add tag to the Notice of Intent');
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
        this.toastService.showErrorToast('Failed to remove tag to the Notice of Intent');
      }
    }
    return;
  }
}
