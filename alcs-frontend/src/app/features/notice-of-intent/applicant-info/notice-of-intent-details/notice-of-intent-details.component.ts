import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_TYPE } from '../../../../shared/document/document.dto';

@Component({
  selector: 'app-noi-details',
  templateUrl: './notice-of-intent-details.component.html',
  styleUrls: ['./notice-of-intent-details.component.scss'],
})
export class NoticeOfIntentDetailsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submission!: NoticeOfIntentSubmissionDetailedDto;
  @Input() noiType!: string;
  @Input() fileNumber!: string;
  @Input() showEdit = false;
  @Input() isSubmittedToAlc = true;
  @Input() wasSubmittedToLfng = false;

  authorizationLetters: NoticeOfIntentDocumentDto[] = [];
  otherFiles: NoticeOfIntentDocumentDto[] = [];
  files: NoticeOfIntentDocumentDto[] | undefined;
  disableEdit = false;
  showFullApp = false;

  constructor(private noiDocumentService: NoiDocumentService) {}

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

  onEdit(step: number) {
    window.location.href = `${environment.portalUrl}/alcs/notice-of-intent/${this.fileNumber}/edit/${step}`;
  }

  async openFile(uuid: string) {
    await this.noiDocumentService.download(uuid, '');
  }

  private async loadDocuments() {
    const documents = await this.noiDocumentService.getApplicantDocuments(this.fileNumber);
    this.otherFiles = documents.filter(
      (document) =>
        document.type &&
        [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.OTHER, DOCUMENT_TYPE.PROFESSIONAL_REPORT].includes(document.type.code)
    );
    this.authorizationLetters = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER
    );
    this.files = documents;
  }
}
