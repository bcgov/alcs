import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { NoticeOfIntentDto, UpdateNoticeOfIntentDto } from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Injectable()
export class NoticeOfIntentDetailService {
  $noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

  private selectedFileNumber: string | undefined;

  constructor(private noticeOfIntentService: NoticeOfIntentService) {}

  async load(fileNumber: string) {
    this.selectedFileNumber = fileNumber;
    const noticeOfIntent = await this.noticeOfIntentService.fetchByFileNumber(fileNumber);
    this.$noticeOfIntent.next(noticeOfIntent);
  }

  async clear() {
    this.$noticeOfIntent.next(undefined);
  }

  async update(fileNumber: string, updateDto: UpdateNoticeOfIntentDto) {
    const updatedNoticeOfIntent = await this.noticeOfIntentService.update(fileNumber, updateDto);
    if (updatedNoticeOfIntent) {
      this.$noticeOfIntent.next(updatedNoticeOfIntent);
    }
    return updatedNoticeOfIntent;
  }
}
