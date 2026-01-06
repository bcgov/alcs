import { Component, OnInit } from '@angular/core';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss'],
    standalone: false
})
export class ReviewComponent implements OnInit {
  fileNumber: string = '';
  DOCUMENT_TYPE = DOCUMENT_TYPE;

  constructor(private planningReviewDetailService: PlanningReviewDetailService) {}

  ngOnInit(): void {
    this.planningReviewDetailService.$planningReview.subscribe((planningReview) => {
      if (planningReview) {
        this.fileNumber = planningReview.fileNumber;
      }
    });
  }
}
