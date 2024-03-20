import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { environment } from '../../../../environments/environment';
import {
  CommissionerApplicationDto,
  CommissionerPlanningReviewDto,
} from '../../../services/commissioner/commissioner.dto';
import { CommissionerService } from '../../../services/commissioner/commissioner.service';

@Component({
  selector: 'app-commissioner-planning-review',
  templateUrl: './commissioner-planning-review.component.html',
  styleUrls: ['./commissioner-planning-review.component.scss'],
})
export class CommissionerPlanningReviewComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;
  planningReview: CommissionerPlanningReviewDto | undefined;
  fileNumber: string | undefined;

  constructor(
    private commissionerService: CommissionerService,
    private route: ActivatedRoute,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.planningReview = await this.commissionerService.fetchPlanningReview(fileNumber);
      this.titleService.setTitle(
        `${environment.siteName} | ${this.planningReview.fileNumber} (${this.planningReview.documentName})`,
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
