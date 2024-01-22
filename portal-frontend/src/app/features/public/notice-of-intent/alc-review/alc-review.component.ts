import { Component, Input } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../services/application-decision/application-decision.dto';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../services/public/public.dto';

@Component({
  selector: 'app-public-alc-review',
  templateUrl: './alc-review.component.html',
  styleUrls: ['./alc-review.component.scss'],
})
export class PublicAlcReviewComponent {
  @Input() submission!: PublicNoticeOfIntentSubmissionDto;
  @Input() documents!: PublicDocumentDto[];
  @Input() decisions!: ApplicationPortalDecisionDto[];

  constructor() {}
}
