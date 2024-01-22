import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SUBMISSION_STATUS } from '../../../services/application-submission/application-submission.dto';
import { NoticeOfIntentPortalDecisionDto } from '../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NOI_SUBMISSION_STATUS } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { PublicNoticeOfIntentSubmissionDto } from '../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto, PublicParcelDto } from '../../../services/public/public.dto';
import { PublicService } from '../../../services/public/public.service';

@Component({
  selector: 'app-public-notice-of-intent',
  templateUrl: './public-notice-of-intent.component.html',
  styleUrls: ['./public-notice-of-intent.component.scss'],
})
export class PublicNoticeOfIntentComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  SUBMISSION_STATUS = SUBMISSION_STATUS;

  submission: PublicNoticeOfIntentSubmissionDto | undefined;
  documents: PublicDocumentDto[] = [];
  parcels: PublicParcelDto[] = [];
  decisions: NoticeOfIntentPortalDecisionDto[] = [];
  selectedIndex = 0;

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
    const res = await this.publicService.getNoticeOfIntent(fileId);
    if (res) {
      const { submission, documents, parcels, decisions } = res;

      this.submission = submission;
      if (submission.status.code === NOI_SUBMISSION_STATUS.ALC_DECISION) {
        this.selectedIndex = 1;
      }
      this.documents = documents;
      this.parcels = parcels;
      this.decisions = decisions;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
