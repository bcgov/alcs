import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InquiryDto, UpdateInquiryDto } from './inquiry.dto';
import { InquiryService } from './inquiry.service';

@Injectable()
export class InquiryDetailService {
  $inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);

  constructor(private inquiryService: InquiryService) {}

  async loadInquiry(fileNumber: string) {
    this.clearReview();

    const planningReview = await this.inquiryService.fetch(fileNumber);
    this.$inquiry.next(planningReview);
  }

  async clearReview() {
    this.$inquiry.next(undefined);
  }

  async update(fileNumber: string, updateDto: UpdateInquiryDto) {
    const updatedApp = await this.inquiryService.update(fileNumber, updateDto);
    if (updatedApp) {
      this.$inquiry.next(updatedApp);
    }
    return updatedApp;
  }
}
