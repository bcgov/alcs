import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { doc } from 'prettier';
import { Subject } from 'rxjs';
import { NotificationDocumentDto } from '../../../../services/notification/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification/notification.dto';
import { DOCUMENT_TYPE } from '../../../../shared/document/document.dto';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submission!: NotificationSubmissionDetailedDto;
  @Input() fileNumber!: string;
  @Input() showEdit = false;
  @Input() isSubmittedToAlc = true;

  otherFiles: NotificationDocumentDto[] = [];
  files: NotificationDocumentDto[] | undefined;
  srwTerms: NotificationDocumentDto[] = [];
  surveyPlans: NotificationDocumentDto[] = [];

  disableEdit = false;
  showFullApp = false;

  constructor(private notificationDocumentService: NotificationDocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.disableEdit = !this.isSubmittedToAlc;
    this.showFullApp = this.isSubmittedToAlc;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    await this.notificationDocumentService.download(uuid, '');
  }

  private async loadDocuments() {
    const documents = await this.notificationDocumentService.getApplicantDocuments(this.fileNumber);
    this.surveyPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SURVEY_PLAN);
    this.srwTerms = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
    this.otherFiles = documents.filter(
      (document) =>
        document.type &&
        [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.OTHER, DOCUMENT_TYPE.PROFESSIONAL_REPORT].includes(document.type.code)
    );
    this.files = documents;
  }

  protected readonly doc = doc;
}
