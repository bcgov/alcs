import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto, UpdateNoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss'],
})
export class IntakeComponent implements OnInit {
  dateSubmittedToAlc?: string;
  noticeOfIntent?: NoticeOfIntentDto;

  constructor(private noticeOfIntentDetailService: NoticeOfIntentDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.dateSubmittedToAlc = moment(noticeOfIntent.dateSubmittedToAlc).format(environment.dateFormat);
        this.noticeOfIntent = noticeOfIntent;
      }
    });
  }

  async updateDate(field: keyof UpdateNoticeOfIntentDto, time: number) {
    const noticeOfIntent = this.noticeOfIntent;
    if (noticeOfIntent) {
      const update = await this.noticeOfIntentDetailService.update(noticeOfIntent.fileNumber, {
        [field]: time,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  async updateNumber(field: keyof UpdateNoticeOfIntentDto, value: string | null) {
    const application = this.noticeOfIntent;
    if (application) {
      const update = await this.noticeOfIntentDetailService.update(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  async updateBoolean(field: keyof UpdateNoticeOfIntentDto, value: boolean) {
    const application = this.noticeOfIntent;
    if (application) {
      const update = await this.noticeOfIntentDetailService.update(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }
}
