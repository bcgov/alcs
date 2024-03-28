import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  inquiry?: InquiryDto;

  constructor(private inquiryDetailService: InquiryDetailService) {}

  ngOnInit(): void {
    this.inquiryDetailService.$inquiry.pipe(takeUntil(this.$destroy)).subscribe((inquiry) => {
      this.inquiry = inquiry;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveStatus($event: string) {
    if (this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        open: $event === 'Open',
      });
    }
  }

  async onSaveSummary($event: string) {
    if (this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        summary: $event,
      });
    }
  }
}
