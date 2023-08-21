import { Component, OnInit } from '@angular/core';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto, UpdateNoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../shared/dto/ag-cap.types.dto';
import { SYSTEM_SOURCE_TYPES } from '../../../shared/dto/system-source.types.dto';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
})
export class ProposalComponent implements OnInit {
  noticeOfIntent?: NoticeOfIntentDto;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;
  alrArea: string | undefined;
  staffObservations = '';
  APPLICATION_SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;

  constructor(private noiDetailService: NoticeOfIntentDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.noiDetailService.$noticeOfIntent.subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.noticeOfIntent = noticeOfIntent;
        this.alrArea = noticeOfIntent.alrArea?.toString();
        this.staffObservations = noticeOfIntent.staffObservations ?? '';
      }
    });
  }

  async onSaveAlrArea(value: string | null) {
    const parsedValue = value ? parseFloat(value) : null;
    await this.updateNoiValue('alrArea', parsedValue);
  }

  async updateNoiValue(field: keyof UpdateNoticeOfIntentDto, value: string[] | string | number | null) {
    const noticeOfIntent = this.noticeOfIntent;
    if (noticeOfIntent) {
      const update = await this.noiDetailService.update(noticeOfIntent.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Notice of Intent updated');
      }
    }
  }

  async onSaveStaffObservations($event: string) {
    await this.updateNoiValue('staffObservations', $event);
  }
}
