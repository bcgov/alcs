import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDto, UpdateInquiryDto } from '../../../services/inquiry/inquiry.dto';
import { InquiryService } from '../../../services/inquiry/inquiry.service';

@Component({
  selector: 'app-detail',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  inquiry?: InquiryDto;
  types: { label: string; value: string }[] = [];
  governments: { label: string; value: string }[] = [];
  regions: { label: string; value: string }[] = [];

  constructor(
    private inquiryDetailService: InquiryDetailService,
    private inquiryService: InquiryService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
  ) {}

  ngOnInit(): void {
    this.inquiryDetailService.$inquiry.pipe(takeUntil(this.$destroy)).subscribe((inquiry) => {
      this.inquiry = inquiry;
      this.loadTypes();
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions.map((region) => ({
        label: region.label,
        value: region.code,
      }));
    });

    this.localGovernmentService.list().then((res) => {
      this.governments = res.map((government) => ({
        label: government.name,
        value: government.uuid,
      }));
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveType($event: string | string[] | null) {
    if ($event && !Array.isArray($event) && this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        typeCode: $event,
      });
    }
  }

  private async loadTypes() {
    const types = await this.inquiryService.fetchTypes();
    if (types) {
      this.types = types.map((type) => ({
        label: type.label,
        value: type.code,
      }));
    }
  }

  async onSaveSubmittedToALC($event: number) {
    if (this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        dateSubmittedToAlc: $event,
      });
    }
  }

  async onSaveTextField($event: string | null, inquirerFirstName: keyof UpdateInquiryDto) {
    if (this.inquiry) {
      await this.inquiryDetailService.update(this.inquiry.fileNumber, {
        [inquirerFirstName]: $event,
      });
    }
  }
}
