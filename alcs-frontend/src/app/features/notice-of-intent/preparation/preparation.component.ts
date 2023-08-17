import { Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import {
  NoticeOfIntentDto,
  NoticeOfIntentSubtypeDto,
  UpdateNoticeOfIntentDto,
} from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-preparation',
  templateUrl: './preparation.component.html',
  styleUrls: ['./preparation.component.scss'],
})
export class PreparationComponent implements OnInit {
  dateSubmittedToAlc?: string;
  selectableTypes: { label: string; value: string }[] = [];
  selectedSubtypes: string[] = [];
  private subtypes: NoticeOfIntentSubtypeDto[] = [];

  _noticeOfIntent: NoticeOfIntentDto | undefined;

  @Input() set noticeOfIntent(noticeOfIntent: NoticeOfIntentDto | undefined) {
    if (noticeOfIntent) {
      this._noticeOfIntent = noticeOfIntent;
      this.dateSubmittedToAlc = moment(noticeOfIntent.dateSubmittedToAlc).format(environment.dateFormat);
      this.selectedSubtypes = noticeOfIntent.subtype.map((subtype) => subtype.label);
    }
  }

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentService: NoticeOfIntentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubtypes();
  }

  async updateBoolean(field: keyof UpdateNoticeOfIntentDto, value: boolean) {
    const application = this._noticeOfIntent;
    if (application) {
      const update = await this.noticeOfIntentDetailService.update(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  private async loadSubtypes() {
    const subtypes = await this.noticeOfIntentService.listSubtypes();
    this.subtypes = subtypes;
    this.selectableTypes = subtypes.map((subtype) => ({
      label: subtype.label,
      value: subtype.label,
    }));
  }

  async saveSubtypes($event: string | string[] | null) {
    if (this._noticeOfIntent && $event instanceof Array) {
      const selectedCodes = $event.map((label) => this.subtypes.find((subtype) => subtype.label === label)!.code);
      await this.noticeOfIntentDetailService.update(this._noticeOfIntent?.fileNumber, {
        subtype: selectedCodes,
      });
    }
  }
}
