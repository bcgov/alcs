import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApplicationService } from '../../../services/application/application.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto, UpdateNoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss'],
})
export class IntakeComponent implements OnInit {
  $destroy = new Subject<void>();

  dateSubmittedToAlc?: string;
  noticeOfIntent?: NoticeOfIntentDto;
  regions: { label: string; value: string; disabled?: boolean | null }[] = [];

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private applicationService: ApplicationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.dateSubmittedToAlc = moment(noticeOfIntent.dateSubmittedToAlc).format(environment.dateFormat);
        this.noticeOfIntent = noticeOfIntent;
      }
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions.map((region) => ({
        label: region.label,
        value: region.code,
      }));
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
        [field]: value ? parseFloat(value) : null,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  async updateBoolean(field: keyof UpdateNoticeOfIntentDto, value: boolean) {
    const noticeOfIntent = this.noticeOfIntent;
    if (noticeOfIntent) {
      const update = await this.noticeOfIntentDetailService.update(noticeOfIntent.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  async updateNoticeOfIntentRegion($event: string | string[] | null) {
    const noticeOfIntent = this.noticeOfIntent;
    if (noticeOfIntent && $event && !Array.isArray($event)) {
      const update = await this.noticeOfIntentDetailService.update(noticeOfIntent.fileNumber, {
        regionCode: $event,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }
}
