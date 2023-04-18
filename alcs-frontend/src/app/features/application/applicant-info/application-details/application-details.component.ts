import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submittedApplication!: ApplicationSubmissionDto;
  @Input() applicationType!: string;
  @Input() fileNumber!: string;
  @Input() showEdit = false;

  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  files: ApplicationDocumentDto[] | undefined;

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onEdit(step: number) {
    window.location.href = `${environment.portalUrl}/alcs/application/${this.fileNumber}/edit/${step}`;
  }

  async openFile(uuid: string) {
    await this.applicationDocumentService.download(uuid, '');
  }

  private async loadDocuments() {
    const documents = await this.applicationDocumentService.getApplicantDocuments(this.fileNumber);
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
