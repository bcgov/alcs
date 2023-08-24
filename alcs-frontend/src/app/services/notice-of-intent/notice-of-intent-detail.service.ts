import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDto, UpdateNoticeOfIntentDto } from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Injectable()
export class NoticeOfIntentDetailService {
  $noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

  constructor(private noticeOfIntentService: NoticeOfIntentService) {}

  async load(fileNumber: string) {
    this.clear();
    const noticeOfIntent = await this.noticeOfIntentService.fetchByFileNumber(fileNumber);
    this.$noticeOfIntent.next(noticeOfIntent);
  }

  clear() {
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
