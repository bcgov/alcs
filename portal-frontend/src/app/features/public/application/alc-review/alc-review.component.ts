import { Component, Input } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../services/application-decision/application-decision.dto';
import { SUBMISSION_STATUS } from '../../../../services/application-submission/application-submission.dto';
import { PublicApplicationSubmissionDto } from '../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../services/public/public.dto';

@Component({
  selector: 'app-public-alc-review',
  templateUrl: './alc-review.component.html',
  styleUrls: ['./alc-review.component.scss'],
})
export class PublicAlcReviewComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() applicationDocuments!: PublicDocumentDto[];
  @Input() applicationDecisions!: ApplicationPortalDecisionDto[];

  SUBMISSION_STATUS = SUBMISSION_STATUS;

  constructor() {}
}
