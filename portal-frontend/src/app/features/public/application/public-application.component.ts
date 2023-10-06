import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationPortalDecisionDto } from '../../../services/application-decision/application-decision.dto';
import { SUBMISSION_STATUS } from '../../../services/application-submission/application-submission.dto';
import {
  PublicApplicationParcelDto,
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
  PublicDocumentDto,
} from '../../../services/public/public.dto';
import { PublicService } from '../../../services/public/public.service';

@Component({
  selector: 'app-public-application',
  templateUrl: './public-application.component.html',
  styleUrls: ['./public-application.component.scss'],
})
export class PublicApplicationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  SUBMISSION_STATUS = SUBMISSION_STATUS;

  submission: PublicApplicationSubmissionDto | undefined;
  review: PublicApplicationSubmissionReviewDto | undefined;
  documents: PublicDocumentDto[] = [];
  parcels: PublicApplicationParcelDto[] = [];
  decisions: ApplicationPortalDecisionDto[] = [];

  constructor(private publicService: PublicService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });
  }

  private async loadApplication(fileId: string) {
    const res = await this.publicService.getApplication(fileId);
    if (res) {
      const { submission, documents, parcels, review, decisions } = res;

      this.submission = submission;
      this.documents = documents;
      this.parcels = parcels;
      this.review = review;
      this.decisions = decisions;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
