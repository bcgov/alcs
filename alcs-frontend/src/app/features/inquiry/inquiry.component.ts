import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InquiryDetailService } from '../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../services/inquiry/inquiry.dto';
import { DetailsComponent } from './detail/details.component';
import { OverviewComponent } from './overview/overview.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Overview',
    icon: 'summarize',
    component: OverviewComponent,
  },
  {
    path: 'details',
    menuTitle: 'Details',
    icon: 'person',
    component: DetailsComponent,
  },
];

@Component({
  selector: 'app-planning-review',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss'],
})
export class InquiryComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  inquiry?: InquiryDto;
  fileNumber?: string;
  childRoutes = childRoutes;

  constructor(
    private planningReviewService: InquiryDetailService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.$destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      await this.loadReview();
    });

    this.planningReviewService.$inquiry.pipe(takeUntil(this.$destroy)).subscribe((inquiry) => {
      this.inquiry = inquiry;
    });
  }

  private async loadReview() {
    if (this.fileNumber) {
      await this.planningReviewService.loadInquiry(this.fileNumber);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
