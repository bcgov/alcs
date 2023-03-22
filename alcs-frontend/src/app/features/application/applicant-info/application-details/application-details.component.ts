import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../../services/application/application-document/application-document.service';
import { SubmittedApplicationDto } from '../../../../services/application/application.dto';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() submittedApplication: SubmittedApplicationDto | undefined;
  @Input() applicationType!: string;
  @Input() fileNumber!: string;

  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  files: ApplicationDocumentDto[] | undefined;

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  ngOnInit(): void {
    console.log('here', this.submittedApplication);
    this.loadDocuments(this.fileNumber);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    await this.applicationDocumentService.download(uuid, '');
  }

  private async loadDocuments(fileNumber: string) {
    const documents = await this.applicationDocumentService.getApplicantDocuments(fileNumber);
    this.otherFiles = documents.filter((document) =>
      [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.OTHER, DOCUMENT_TYPE.PROFESSIONAL_REPORT].includes(document.type)
    );
    this.authorizationLetters = documents.filter((document) => document.type === DOCUMENT_TYPE.AUTHORIZATION_LETTER);
    this.files = documents;
  }
}
