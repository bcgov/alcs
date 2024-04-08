import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../shared/document/document.dto';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submission!: ApplicationSubmissionDto;
  @Input() applicationType!: string;
  @Input() fileNumber!: string;
  @Input() showEdit = false;
  @Input() isSubmittedToAlc = true;
  @Input() wasSubmittedToLfng = false;

  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  files: ApplicationDocumentDto[] | undefined;
  disableEdit = false;
  showFullApp = false;

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.disableEdit = this.wasSubmittedToLfng || !this.isSubmittedToAlc;
    this.showFullApp = this.wasSubmittedToLfng || this.isSubmittedToAlc;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onEdit(step: number) {
    window.location.href = `${environment.portalUrl}/alcs/application/${this.fileNumber}/edit/${step}`;
  }

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }

  private async loadDocuments() {
    const documents = await this.applicationDocumentService.getApplicantDocuments(this.fileNumber);
    this.otherFiles = documents.filter(
      (document) =>
        document.type &&
        [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.OTHER, DOCUMENT_TYPE.PROFESSIONAL_REPORT].includes(document.type.code),
    );
    this.authorizationLetters = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER,
    );
    this.files = documents;
  }
}
