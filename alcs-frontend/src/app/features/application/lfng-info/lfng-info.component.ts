import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentDto } from '../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../services/application/application-document/application-document.service';
import { ApplicationReviewDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-lfng-info',
  templateUrl: './lfng-info.component.html',
  styleUrls: ['./lfng-info.component.scss'],
})
export class LfngInfoComponent implements OnInit {
  applicationReview: ApplicationReviewDto | undefined;
  resolutionDocument: ApplicationDocumentDto | undefined;
  staffReport: ApplicationDocumentDto | undefined;
  otherAttachments: ApplicationDocumentDto[] = [];
  requiresReview = true;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.requiresReview = application.type.code !== 'TURP';
        this.applicationReview = application.applicationReview;
        this.loadDocuments(application.fileNumber);
      }
    });
  }

  async openDocument(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }

  private async loadDocuments(fileNumber: string) {
    const documents = await this.applicationDocumentService.getReviewDocuments(fileNumber);
    this.resolutionDocument = documents.find((doc) => doc.type === DOCUMENT_TYPE.RESOLUTION_DOCUMENT);
    this.staffReport = documents.find((doc) => doc.type === DOCUMENT_TYPE.STAFF_REPORT);
    this.otherAttachments = documents.filter((doc) => doc.type === DOCUMENT_TYPE.REVIEW_OTHER);
  }
}
