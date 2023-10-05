import { Component, Input, OnInit } from '@angular/core';
import { SUBMISSION_STATUS } from '../../../../services/application-submission/application-submission.dto';
import {
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
  PublicDocumentDto,
} from '../../../../services/public/public.dto';
import { PublicService } from '../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';

@Component({
  selector: 'app-public-lfng-review',
  templateUrl: './lfng-review.component.html',
  styleUrls: ['./lfng-review.component.scss'],
})
export class PublicLfngReviewComponent implements OnInit {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() applicationDocuments!: PublicDocumentDto[];
  @Input() applicationReview: PublicApplicationSubmissionReviewDto | undefined;

  SUBMISSION_STATUS = SUBMISSION_STATUS;
  resolutionDocument: PublicDocumentDto[] = [];

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    this.resolutionDocument = this.applicationDocuments.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
    );
  }

  async openFile(uuid: string) {
    const res = await this.publicService.getApplicationFileUrl(this.applicationSubmission.fileNumber, uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
