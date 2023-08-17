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
  staffObservations: string = '';
  APPLICATION_SYSTEM_SOURCE_TYPES = SYSTEM_SOURCE_TYPES;

  constructor(private noiDetailService: NoticeOfIntentDetailService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.noiDetailService.$noticeOfIntent.subscribe((application) => {
      if (application) {
        this.noticeOfIntent = application;
        this.alrArea = application.alrArea?.toString();
        this.staffObservations = application.staffObservations ?? '';
      }
    });
  }

  async onSaveAlrArea(value: string | null) {
    const parsedValue = value ? parseFloat(value) : null;
    await this.updateApplicationValue('alrArea', parsedValue);
  }

  async updateApplicationValue(field: keyof UpdateNoticeOfIntentDto, value: string[] | string | number | null) {
    const application = this.noticeOfIntent;
    if (application) {
      const update = await this.noiDetailService.update(application.fileNumber, {
        [field]: value,
      });
      if (update) {
        this.toastService.showSuccessToast('Application updated');
      }
    }
  }

  async onSaveStaffObservations($event: string) {
    await this.updateApplicationValue('staffObservations', $event);
  }
}
