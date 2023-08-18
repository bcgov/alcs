import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentDto, NoticeOfIntentSubmissionDto, UpdateNoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-proposal-soil',
  templateUrl: './soil.component.html',
  styleUrls: ['./soil.component.scss'],
})
export class SoilProposalComponent implements OnDestroy, OnInit {
  $destroy = new Subject<void>();
  noticeOfIntent: NoticeOfIntentDto | undefined;
  submission: NoticeOfIntentSubmissionDto | undefined;

  constructor(
    private applicationDetailService: NoticeOfIntentDetailService,
    private applicationSubmissionService: NoticeOfIntentSubmissionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe(async (application) => {
      if (application) {
        this.noticeOfIntent = application;
        this.submission = await this.applicationSubmissionService.fetchSubmission(application.fileNumber);
      }
    });
  }

  async updateValue(field: keyof UpdateNoticeOfIntentDto, value: string[] | string | number | null) {
    const application = this.noticeOfIntent;
    if (application) {
      const update = await this.applicationDetailService.update(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
