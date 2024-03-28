import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InquiryDetailService } from '../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../services/inquiry/inquiry.dto';
import { DetailsComponent } from './detail/details.component';
import { DocumentsComponent } from './documents/documents.component';
import { OverviewComponent } from './overview/overview.component';
import { ParcelsComponent } from './parcel/parcels.component';

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
  {
    path: 'parcels',
    menuTitle: 'Parcels',
    icon: 'crop_free',
    component: ParcelsComponent,
  },
  {
    path: 'documents',
    menuTitle: 'Documents',
    icon: 'description',
    component: DocumentsComponent,
  },
];

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss'],
})
export class InquiryComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  inquiry?: InquiryDto;
  fileNumber?: string;
  childRoutes = childRoutes;

  constructor(
    private inquiryDetailService: InquiryDetailService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.$destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      await this.loadReview();
    });

    this.inquiryDetailService.$inquiry.pipe(takeUntil(this.$destroy)).subscribe((inquiry) => {
      this.inquiry = inquiry;
    });
  }

  private async loadReview() {
    if (this.fileNumber) {
      await this.inquiryDetailService.loadInquiry(this.fileNumber);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
