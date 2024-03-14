import { Component, Input, OnInit } from '@angular/core';
import { SUBMISSION_STATUS } from '../../../../services/application-submission/application-submission.dto';
import {
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
} from '../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../services/public/public.dto';
import { PublicService } from '../../../../services/public/public.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { openFileWindow } from '../../../../shared/utils/file';

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

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileWindow(res.url, file.fileName);
    }
  }
}
