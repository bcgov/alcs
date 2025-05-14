import { Component, Input, OnInit } from '@angular/core';
import { SUBMISSION_STATUS } from '../../../../services/application-submission/application-submission.dto';
import {
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
} from '../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../services/public/public.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

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

  constructor(
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.resolutionDocument = this.applicationDocuments.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT
    );
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, false);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }
}
